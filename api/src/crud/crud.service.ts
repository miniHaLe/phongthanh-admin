import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { and, eq, ilike, inArray, or, sql, type SQL } from 'drizzle-orm'
import type { DbClient } from '../db/client'
import type { AuthenticatedUser } from '../auth/jwt-payload'
import type { CrudResourceConfig } from './crud-resource-config'
import type { ListParamsQuery } from './list-params.dto'

export interface PagedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * Generic CRUD engine parameterized per resource by `CrudResourceConfig`.
 * Every DB-facing input (`sort`, `filters` keys, branch scope) is resolved
 * through the config's allowlists BEFORE reaching a query builder call — the
 * five security gates from the plan live here, once, for every resource.
 */
export class CrudService {
  constructor(
    private readonly db: DbClient,
    private readonly config: CrudResourceConfig,
  ) {}

  /** Hard trailing AND — branch scope is never a client-controllable filter.
   * `inArray` with an empty array compiles to a literal `false` (verified),
   * giving "empty set ⇒ deny, never all" for free — a raw `sql` IN template
   * would emit invalid `IN ()` syntax on empty input, so `inArray` is used
   * deliberately here instead. */
  private branchScopeCondition(user: AuthenticatedUser): SQL | undefined {
    if (!this.config.branchColumn) return undefined
    if (user.superScope) return undefined
    return inArray(this.config.branchColumn, user.branchIds)
  }

  private resolveSortColumn(sortKey: string) {
    const column = this.config.sortableColumns[sortKey]
    if (!column) {
      throw new BadRequestException(
        `Trường sắp xếp không hợp lệ: "${sortKey}"`,
      )
    }
    return column
  }

  private buildFilterConditions(
    filters: Record<string, unknown> | undefined,
  ): SQL[] {
    if (!filters) return []
    const conditions: SQL[] = []
    for (const [key, rawValue] of Object.entries(filters)) {
      if (rawValue === undefined || rawValue === '' || rawValue === null) {
        continue
      }
      const filterable = this.config.filterableColumns[key]
      if (!filterable) {
        throw new BadRequestException(`Trường lọc không hợp lệ: "${key}"`)
      }
      const value = filterable.parse ? filterable.parse(rawValue) : rawValue
      conditions.push(eq(filterable.column, value))
    }
    return conditions
  }

  private buildSearchCondition(search: string | undefined): SQL | undefined {
    if (!search || this.config.searchColumns.length === 0) return undefined
    const like = `%${search}%`
    const clauses = this.config.searchColumns.map((col) => ilike(col, like))
    return or(...clauses)
  }

  async list(
    params: ListParamsQuery,
    user: AuthenticatedUser,
  ): Promise<PagedResult<Record<string, unknown>>> {
    const conditions: (SQL | undefined)[] = [
      this.branchScopeCondition(user),
      this.buildSearchCondition(params.search),
      ...this.buildFilterConditions(params.filters),
    ]
    const whereClause = and(...conditions.filter((c): c is SQL => !!c))

    let query = this.db.select().from(this.config.table).$dynamic()
    if (whereClause) query = query.where(whereClause)

    if (params.sort) {
      const column = this.resolveSortColumn(params.sort)
      // COLLATE is only valid on collatable (text) types — applying it to a
      // timestamp/int/bool column throws `transformCollateClause` (500). Text
      // columns get vi-collation ordering; others sort natively. `createdAt`
      // (khach-hang's default sort) is a timestamptz, so this guard is on the
      // hot path, not an edge case.
      const isTextColumn =
        (column as { dataType?: string }).dataType === 'string'
      const dir = params.dir === 'desc' ? sql`DESC` : sql`ASC`
      query = query.orderBy(
        isTextColumn
          ? sql`${column} COLLATE "vi-VN-x-icu" ${dir}`
          : sql`${column} ${dir}`,
      )
    }

    const offset = (params.page - 1) * params.pageSize
    const rows = await query.limit(params.pageSize).offset(offset)

    const countQuery = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.config.table)
      .$dynamic()
    const [{ count }] = whereClause
      ? await countQuery.where(whereClause)
      : await countQuery

    return {
      data: rows as Record<string, unknown>[],
      total: count,
      page: params.page,
      pageSize: params.pageSize,
    }
  }

  private scopedRowCondition(id: string, user: AuthenticatedUser) {
    const idMatch = eq(this.config.idColumn, id)
    const branchScope = this.branchScopeCondition(user)
    return branchScope ? and(idMatch, branchScope) : idMatch
  }

  async get(
    id: string,
    user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    const [row] = await this.db
      .select()
      .from(this.config.table)
      .where(this.scopedRowCondition(id, user))
      .limit(1)
    if (!row) {
      throw new NotFoundException(this.config.notFoundMessage(id))
    }
    return row as Record<string, unknown>
  }

  /** The stamped-row property key for the branch column. Drizzle rows are keyed
   * by the SCHEMA PROPERTY name (`branchId`), not the SQL column name
   * (`branch_id`), so we resolve it by reference-matching the configured column
   * against the table's columns rather than reading `.name` (which is the SQL
   * name and would miss the row key). */
  private branchRowKey(): string | undefined {
    if (!this.config.branchColumn) return undefined
    const columns = this.config.table as unknown as Record<string, unknown>
    for (const [key, col] of Object.entries(columns)) {
      if (col === this.config.branchColumn) return key
    }
    return undefined
  }

  /** A non-super user may only write within their own branch set. The row's
   * effective branch (server-stamped on create, e.g. khach-hang derives it from
   * tinhId) must be in `user.branchIds`; otherwise the write would plant a row
   * in a branch the user cannot even read back (403, not a silent 201). */
  private assertBranchWritable(
    row: Record<string, unknown>,
    user: AuthenticatedUser,
  ): void {
    if (!this.config.branchColumn || user.superScope) return
    const branchKey = this.branchRowKey()
    const branchValue = branchKey ? row[branchKey] : undefined
    if (
      typeof branchValue !== 'string' ||
      !user.branchIds.includes(branchValue)
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền tạo/sửa dữ liệu ở chi nhánh này',
      )
    }
  }

  async create(
    dto: Record<string, unknown>,
    user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    const now = new Date()
    const stamped = this.config.stampCreate
      ? this.config.stampCreate(dto, { user })
      : dto
    const row = {
      ...stamped,
      id: this.config.genId(),
      createdAt: now,
      active: (dto.active as boolean | undefined) ?? true,
    }
    // Gate 4 on the WRITE path: a cn-1 user cannot POST a row into cn-2.
    this.assertBranchWritable(row, user)
    const [inserted] = await this.db
      .insert(this.config.table)
      .values(row)
      .returning()
    return inserted as Record<string, unknown>
  }

  async update(
    id: string,
    dto: Record<string, unknown>,
    user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    // Read-scoped existence check first so a branch-forged update on another
    // branch's row 404s instead of silently succeeding or leaking a 403.
    await this.get(id, user)
    // Branch predicate on the write ITSELF (not just the prior read) — closes
    // the TOCTOU window and stays correct if branchId ever becomes mutable.
    const [updated] = await this.db
      .update(this.config.table)
      .set({ ...dto, updatedAt: new Date() })
      .where(this.scopedRowCondition(id, user))
      .returning()
    if (!updated) {
      throw new NotFoundException(this.config.notFoundMessage(id))
    }
    return updated as Record<string, unknown>
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    await this.get(id, user)
    await this.db
      .delete(this.config.table)
      .where(this.scopedRowCondition(id, user))
  }
}

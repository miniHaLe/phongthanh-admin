import type { AnyPgColumn, AnyPgTable } from 'drizzle-orm/pg-core'
import type { AuthenticatedUser } from '../auth/jwt-payload'

export type FilterValueType = 'string' | 'number' | 'boolean'

/** A single allowlisted filter column and its shared scalar contract. */
export interface FilterableColumn {
  column: AnyPgColumn
  valueType?: FilterValueType
}

export interface CrudContext {
  user: AuthenticatedUser
}

export type CrudWriteOperation = 'create' | 'update' | 'delete'

export interface CrudWriteContext extends CrudContext {
  operation: CrudWriteOperation
  id?: string
  dto?: Record<string, unknown>
}

/**
 * Declarative per-resource wiring for the generic CRUD engine. Every field
 * here IS the security gate: only columns listed in `sortableColumns` /
 * `filterableColumns` are reachable from client input (gates 1 + 2);
 * `branchColumn` (when set) is never in `filterableColumns` and is enforced
 * as a hard trailing AND, not a client-controllable filter (gate 4).
 *
 * `TInsertRow`/`TRow` are intentionally loose (`Record<string, unknown>`):
 * Drizzle's per-table insert/select types don't unify across arbitrary
 * tables without heavy generic plumbing that buys nothing at n=1 resource
 * (YAGNI) — DTO shape correctness is enforced by the Zod schema at the
 * controller boundary, not by this config's typing.
 */
export interface CrudResourceConfig {
  table: AnyPgTable
  idColumn: AnyPgColumn
  createdAtColumn: AnyPgColumn
  updatedAtColumn: AnyPgColumn
  activeColumn: AnyPgColumn
  /** Client-facing sort key -> actual column. Unknown key => 400. */
  sortableColumns: Record<string, AnyPgColumn>
  /** Client-facing filter key -> column + scalar type. Unknown key => 400. */
  filterableColumns: Record<string, FilterableColumn>
  /** Columns the free-text `search` param matches against (case-insensitive
   * substring), mirroring the mock's "any string field contains" behavior. */
  searchColumns: AnyPgColumn[]
  /** Branch-scope column, e.g. `khachHang.branchId`. Undefined = resource is
   * not branch-scoped (e.g. global lookups). NEVER put this column in
   * `filterableColumns`. */
  branchColumn?: AnyPgColumn
  notFoundMessage: (id: string) => string
  genId: () => string
  /** Additional server-owned fields a resource stamps on create beyond the
   * BaseEntity ones the engine already stamps (id/createdAt/active) — e.g.
   * khach-hang's `branchId` (derived from tinhId) + `nguoiTao` (from JWT). */
  stampCreate?: (
    dto: Record<string, unknown>,
    ctx: CrudContext,
  ) => Record<string, unknown> | Promise<Record<string, unknown>>
  /** Projects a selected/inserted row before it crosses the HTTP boundary. */
  toResponse?: (
    row: Record<string, unknown>,
  ) => Record<string, unknown> | Promise<Record<string, unknown>>
  /** Resource-level write gate used for temporary coarse authorization. */
  writeGuard?: (ctx: CrudWriteContext) => void | Promise<void>
  /** Vietnamese message returned when Postgres rejects a unique value. */
  uniqueViolationMessage?: string
  /** Optional resource-specific message for an invalid/in-use foreign key. */
  foreignKeyViolationMessage?: string
}

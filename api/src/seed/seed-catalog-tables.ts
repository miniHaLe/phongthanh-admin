/** Natural-key-aware seeding for the four global catalog tables. These
 * tables carry unique indexes on business keys (normalized name, bank code,
 * model parent+name), so on a live database a fixture row can collide with a
 * row users created under a different id. Instead of failing, resolve each
 * fixture row against the existing natural key first: on a hit, skip the
 * insert and record fixtureId → existingId so child fixtures (model,
 * hang_hoa, phi_giao) can be rewritten to the surviving row. */
import { eq, inArray, sql } from 'drizzle-orm'
import type { DbClient } from '../db/client'
import * as schema from '../db/schema'
import type { SeedFixtures } from './load-fixtures'

export type CatalogSeedFixtures = Pick<
  SeedFixtures,
  'nhaSanXuat' | 'sanPham' | 'nganHang' | 'model'
>

export interface CatalogIdMaps {
  nhaSanXuat: Map<string, string>
  sanPham: Map<string, string>
  nganHang: Map<string, string>
  model: Map<string, string>
}

/** Rewrites a fixture FK through a resolution map (identity when unmapped). */
export function mapCatalogId(map: Map<string, string>, id: string): string
export function mapCatalogId(
  map: Map<string, string>,
  id: string | null,
): string | null
export function mapCatalogId(
  map: Map<string, string>,
  id: string | undefined,
): string | undefined
export function mapCatalogId(
  map: Map<string, string>,
  id: string | null | undefined,
): string | null | undefined {
  return id == null ? id : (map.get(id) ?? id)
}

/** Matches the `lower(trim(...))` expression the unique indexes are built on. */
function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}

function catalogTimestamps(row: { createdAt: string; updatedAt?: string }) {
  return {
    createdAt: new Date(row.createdAt),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
  }
}

interface NamedTable {
  table:
    typeof schema.nhaSanXuat | typeof schema.sanPham | typeof schema.nganHang
  idColumn:
    | typeof schema.nhaSanXuat.id
    | typeof schema.sanPham.id
    | typeof schema.nganHang.id
  nameColumn:
    | typeof schema.nhaSanXuat.tenNSX
    | typeof schema.sanPham.tenSP
    | typeof schema.nganHang.tenNganHang
}

/** Resolves fixture rows against existing rows sharing the normalized name.
 * Returns the fixture rows that still need inserting plus the id map for
 * rows adopted from the live table. */
async function resolveByName<F extends { id: string }>(
  db: DbClient,
  { table, idColumn, nameColumn }: NamedTable,
  rows: F[],
  getName: (row: F) => string,
): Promise<{
  toInsert: F[]
  idMap: Map<string, string>
  fixtureOwnedIds: Set<string>
}> {
  const idMap = new Map<string, string>()
  const fixtureOwnedIds = new Set<string>()
  if (rows.length === 0) return { toInsert: [], idMap, fixtureOwnedIds }

  const normalizedExpr = sql<string>`lower(trim(${nameColumn}))`
  const names = [...new Set(rows.map((row) => normalizeName(getName(row))))]
  const existing = await db
    .select({ id: idColumn, name: normalizedExpr })
    .from(table)
    .where(inArray(normalizedExpr, names))
  const existingByName = new Map(existing.map((row) => [row.name, row.id]))
  const existingFixtureIds = new Set(
    (
      await db
        .select({ id: idColumn })
        .from(table)
        .where(
          inArray(
            idColumn,
            rows.map((row) => row.id),
          ),
        )
    ).map((row) => row.id),
  )

  const toInsert: F[] = []
  for (const row of rows) {
    const existingId = existingByName.get(normalizeName(getName(row)))
    if (existingId === undefined) {
      if (existingFixtureIds.has(row.id)) {
        fixtureOwnedIds.add(row.id)
      } else {
        toInsert.push(row)
      }
    } else if (existingId !== row.id) {
      idMap.set(row.id, existingId)
    } else {
      fixtureOwnedIds.add(row.id)
    }
  }
  return { toInsert, idMap, fixtureOwnedIds }
}

export async function seedCatalogTables(
  db: DbClient,
  fixtures: CatalogSeedFixtures,
): Promise<CatalogIdMaps> {
  const nhaSanXuat = await resolveByName(
    db,
    {
      table: schema.nhaSanXuat,
      idColumn: schema.nhaSanXuat.id,
      nameColumn: schema.nhaSanXuat.tenNSX,
    },
    fixtures.nhaSanXuat,
    (row) => row.tenNSX,
  )
  if (nhaSanXuat.toInsert.length > 0) {
    await db
      .insert(schema.nhaSanXuat)
      .values(
        nhaSanXuat.toInsert.map((row) => ({
          ...row,
          ...catalogTimestamps(row),
        })),
      )
      .onConflictDoNothing({ target: schema.nhaSanXuat.id })
  }

  const sanPham = await resolveByName(
    db,
    {
      table: schema.sanPham,
      idColumn: schema.sanPham.id,
      nameColumn: schema.sanPham.tenSP,
    },
    fixtures.sanPham,
    (row) => row.tenSP,
  )
  if (sanPham.toInsert.length > 0) {
    await db
      .insert(schema.sanPham)
      .values(
        sanPham.toInsert.map((row) => ({ ...row, ...catalogTimestamps(row) })),
      )
      .onConflictDoNothing({ target: schema.sanPham.id })
  }
  for (const row of fixtures.sanPham) {
    if (!sanPham.fixtureOwnedIds.has(row.id)) continue
    await db
      .update(schema.sanPham)
      .set({
        maSP: row.maSP,
        tenSP: row.tenSP,
        nhomSanPhamId: row.nhomSanPhamId,
        tienKhoan: row.tienKhoan,
        active: row.active,
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
      })
      .where(eq(schema.sanPham.id, row.id))
  }

  // Banks are unique on the bank code as well as the normalized name; a code
  // hit must win so `VCB` never seeds twice under two names.
  const nganHangByCode = new Map<string, string>()
  if (fixtures.nganHang.length > 0) {
    const codes = fixtures.nganHang.map((row) => row.maNganHang)
    const existing = await db
      .select({ id: schema.nganHang.id, code: schema.nganHang.maNganHang })
      .from(schema.nganHang)
      .where(inArray(schema.nganHang.maNganHang, codes))
    for (const row of existing) nganHangByCode.set(row.code, row.id)
  }
  const nganHangRows = fixtures.nganHang.filter(
    (row) =>
      !nganHangByCode.has(row.maNganHang) ||
      nganHangByCode.get(row.maNganHang) === row.id,
  )
  const nganHang = await resolveByName(
    db,
    {
      table: schema.nganHang,
      idColumn: schema.nganHang.id,
      nameColumn: schema.nganHang.tenNganHang,
    },
    nganHangRows,
    (row) => row.tenNganHang,
  )
  for (const row of fixtures.nganHang) {
    const byCode = nganHangByCode.get(row.maNganHang)
    if (byCode !== undefined && byCode !== row.id) {
      nganHang.idMap.set(row.id, byCode)
    }
  }
  if (nganHang.toInsert.length > 0) {
    await db
      .insert(schema.nganHang)
      .values(
        nganHang.toInsert.map((row) => ({ ...row, ...catalogTimestamps(row) })),
      )
      .onConflictDoNothing({ target: schema.nganHang.id })
  }

  // Models resolve on (manufacturer, product, normalized name) — parents must
  // be rewritten through the maps above before the key is comparable.
  const modelIdMap = new Map<string, string>()
  const modelsToInsert: SeedFixtures['model'] = []
  if (fixtures.model.length > 0) {
    const norms = [
      ...new Set(fixtures.model.map((row) => row.tenModelNormalized)),
    ]
    const existing = await db
      .select({
        id: schema.model.id,
        nhaSanXuatId: schema.model.nhaSanXuatId,
        sanPhamId: schema.model.sanPhamId,
        norm: schema.model.tenModelNormalized,
      })
      .from(schema.model)
      .where(inArray(schema.model.tenModelNormalized, norms))
    const modelKey = (nsx: string, sp: string, norm: string) =>
      `${nsx} ${sp} ${norm}`
    const existingByKey = new Map(
      existing.map((row) => [
        modelKey(row.nhaSanXuatId, row.sanPhamId, row.norm),
        row.id,
      ]),
    )
    for (const row of fixtures.model) {
      const mapped = {
        ...row,
        nhaSanXuatId: mapCatalogId(nhaSanXuat.idMap, row.nhaSanXuatId),
        sanPhamId: mapCatalogId(sanPham.idMap, row.sanPhamId),
      }
      const existingId = existingByKey.get(
        modelKey(
          mapped.nhaSanXuatId,
          mapped.sanPhamId,
          mapped.tenModelNormalized,
        ),
      )
      if (existingId === undefined) {
        modelsToInsert.push(mapped)
      } else if (existingId !== row.id) {
        modelIdMap.set(row.id, existingId)
      }
    }
  }
  if (modelsToInsert.length > 0) {
    await db
      .insert(schema.model)
      .values(
        modelsToInsert.map((row) => ({ ...row, ...catalogTimestamps(row) })),
      )
      .onConflictDoNothing({ target: schema.model.id })
  }

  return {
    nhaSanXuat: nhaSanXuat.idMap,
    sanPham: sanPham.idMap,
    nganHang: nganHang.idMap,
    model: modelIdMap,
  }
}

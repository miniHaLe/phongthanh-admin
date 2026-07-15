/** Natural-key collision behavior: a fixture catalog row whose name/code
 * already exists in the DB under a different id must be adopted (not
 * inserted), and child references must be rewritten to the surviving id. */
import { eq } from 'drizzle-orm'
import { createDbClient, type DbClient } from '../db/client'
import * as schema from '../db/schema'
import { seedCatalogTables } from './seed-catalog-tables'

const NOW = new Date('2026-01-01T00:00:00.000Z')

const PRE_EXISTING = {
  nhaSanXuat: { id: 'nsx-nk-live', tenNSX: 'NK Test Brand' },
  sanPham: { id: 'sp-nk-live', tenSP: 'NK Test Product' },
  nganHang: {
    id: 'ngh-nk-live',
    maNganHang: 'NKTEST',
    tenNganHang: 'NK Test Bank',
  },
}

const FIXTURES = {
  // Name differs only by case/whitespace — must match the normalized index.
  nhaSanXuat: [
    {
      id: 'nsx-nk-fx',
      tenNSX: '  nk test BRAND ',
      active: true,
      createdAt: NOW.toISOString(),
    },
  ],
  sanPham: [
    {
      id: 'sp-nk-fx',
      tenSP: 'NK Test Product',
      active: true,
      createdAt: NOW.toISOString(),
    },
  ],
  // Same bank code under a different name — the code hit must win.
  nganHang: [
    {
      id: 'ngh-nk-fx',
      maNganHang: 'NKTEST',
      tenNganHang: 'NK Renamed Bank',
      active: true,
      createdAt: NOW.toISOString(),
    },
  ],
  model: [
    {
      id: 'mod-nk-fx',
      tenModel: 'NK Model',
      tenModelNormalized: 'nk model',
      nhaSanXuatId: 'nsx-nk-fx',
      sanPhamId: 'sp-nk-fx',
      active: true,
      createdAt: NOW.toISOString(),
    },
  ],
}

describe('seedCatalogTables natural-key resolution', () => {
  let db: DbClient
  let pool: ReturnType<typeof createDbClient>['pool']

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) throw new Error('DATABASE_URL is required')
    ;({ db, pool } = createDbClient(databaseUrl))

    await db.insert(schema.nhaSanXuat).values({
      ...PRE_EXISTING.nhaSanXuat,
      active: true,
      createdAt: NOW,
    })
    await db.insert(schema.sanPham).values({
      ...PRE_EXISTING.sanPham,
      active: true,
      createdAt: NOW,
    })
    await db.insert(schema.nganHang).values({
      ...PRE_EXISTING.nganHang,
      active: true,
      createdAt: NOW,
    })
  })

  afterAll(async () => {
    await db.delete(schema.model).where(eq(schema.model.id, 'mod-nk-fx'))
    await db
      .delete(schema.nganHang)
      .where(eq(schema.nganHang.id, PRE_EXISTING.nganHang.id))
    await db
      .delete(schema.nhaSanXuat)
      .where(eq(schema.nhaSanXuat.id, PRE_EXISTING.nhaSanXuat.id))
    await db
      .delete(schema.sanPham)
      .where(eq(schema.sanPham.id, PRE_EXISTING.sanPham.id))
    await pool.end()
  })

  it('adopts colliding rows, remaps children, and stays idempotent', async () => {
    const maps = await seedCatalogTables(db, FIXTURES)

    expect(maps.nhaSanXuat.get('nsx-nk-fx')).toBe('nsx-nk-live')
    expect(maps.sanPham.get('sp-nk-fx')).toBe('sp-nk-live')
    expect(maps.nganHang.get('ngh-nk-fx')).toBe('ngh-nk-live')

    // No duplicate catalog rows were inserted under the fixture ids.
    const fixtureIdRows = await Promise.all([
      db
        .select()
        .from(schema.nhaSanXuat)
        .where(eq(schema.nhaSanXuat.id, 'nsx-nk-fx')),
      db.select().from(schema.sanPham).where(eq(schema.sanPham.id, 'sp-nk-fx')),
      db
        .select()
        .from(schema.nganHang)
        .where(eq(schema.nganHang.id, 'ngh-nk-fx')),
    ])
    expect(fixtureIdRows.map((rows) => rows.length)).toEqual([0, 0, 0])

    // The model was new, so it seeds under its own id with remapped parents.
    const [model] = await db
      .select()
      .from(schema.model)
      .where(eq(schema.model.id, 'mod-nk-fx'))
    expect(model).toBeDefined()
    expect(model.nhaSanXuatId).toBe('nsx-nk-live')
    expect(model.sanPhamId).toBe('sp-nk-live')

    // Second run: everything resolves to existing rows, nothing new inserted.
    const secondMaps = await seedCatalogTables(db, FIXTURES)
    expect(secondMaps.model.size).toBe(0)
    const models = await db
      .select()
      .from(schema.model)
      .where(eq(schema.model.tenModelNormalized, 'nk model'))
    expect(models).toHaveLength(1)
  })
})

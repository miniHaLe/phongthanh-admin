import { sql } from 'drizzle-orm'
import type { AnyPgTable } from 'drizzle-orm/pg-core'
import { createDbClient, type DbClient } from '../db/client'
import * as schema from '../db/schema'
import { seedDatabase, type SeedResult } from './seed-database'

const INITIAL_ADMIN_PASSWORD = 'Test!Admin2026'

const seededTables: Record<keyof SeedResult, AnyPgTable> = {
  chiNhanh: schema.chiNhanh,
  tinh: schema.tinh,
  quan: schema.quan,
  xa: schema.xa,
  loaiKhachHang: schema.loaiKhachHang,
  nhomQuyen: schema.nhomQuyen,
  nguoiDung: schema.nguoiDung,
  khachHang: schema.khachHang,
  donViTinh: schema.donViTinh,
  nhomSanPham: schema.nhomSanPham,
  nhomHangHoa: schema.nhomHangHoa,
  nhaSanXuat: schema.nhaSanXuat,
  thoiHan: schema.thoiHan,
  nhaKho: schema.nhaKho,
  phuongXa: schema.phuongXa,
  khuVuc: schema.khuVuc,
  loiSuaChua: schema.loiSuaChua,
  nganChua: schema.nganChua,
  sanPham: schema.sanPham,
  phiGiao: schema.phiGiao,
  model: schema.model,
  hangHoa: schema.hangHoa,
}

async function countSeededTables(db: DbClient): Promise<SeedResult> {
  const counts = {} as SeedResult
  for (const key of Object.keys(seededTables) as Array<keyof SeedResult>) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(seededTables[key])
    counts[key] = count
  }
  return counts
}

describe('seedDatabase idempotency', () => {
  it('keeps every seeded table count stable across two repeated runs', async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) throw new Error('DATABASE_URL is required')

    const { db, pool } = createDbClient(databaseUrl)
    try {
      const before = await countSeededTables(db)
      const firstResult = await seedDatabase(db, INITIAL_ADMIN_PASSWORD)
      const afterFirst = await countSeededTables(db)
      const secondResult = await seedDatabase(db, INITIAL_ADMIN_PASSWORD)
      const afterSecond = await countSeededTables(db)

      expect(firstResult).toEqual(secondResult)
      expect(afterFirst).toEqual(before)
      expect(afterSecond).toEqual(afterFirst)

      for (const key of Object.keys(firstResult) as Array<keyof SeedResult>) {
        expect(afterSecond[key]).toBeGreaterThanOrEqual(firstResult[key])
      }
    } finally {
      await pool.end()
    }
  })
})

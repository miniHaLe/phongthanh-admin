import { eq, sql } from 'drizzle-orm'
import type { AnyPgTable } from 'drizzle-orm/pg-core'
import { createDbClient, type DbClient } from '../db/client'
import * as schema from '../db/schema'
import { seedDatabase, type SeedResult } from './seed-database'
import { loadFixtures } from './load-fixtures'

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
  legacyPhuongXa: schema.phuongXaLegacy,
  khuVuc: schema.khuVuc,
  loiSuaChua: schema.loiSuaChua,
  nganChua: schema.nganChua,
  sanPham: schema.sanPham,
  phiGiao: schema.phiGiao,
  model: schema.model,
  hangHoa: schema.hangHoa,
  nganHang: schema.nganHang,
  tinhThanh: schema.tinhThanh,
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

  it('converges fixture-owned catalog taxonomy without changing user rows', async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) throw new Error('DATABASE_URL is required')

    const fixtures = loadFixtures()
    const productGroup = fixtures.nhomSanPham[0]
    const goodsGroup = fixtures.nhomHangHoa[2]
    const product = fixtures.sanPham[0]
    const goods = fixtures.hangHoa[0]
    const userProductGroupId = 'nhomsp-user-seed-convergence'
    const userGoodsGroupId = 'nhh-user-seed-convergence'
    const { db, pool } = createDbClient(databaseUrl)

    try {
      await db.insert(schema.nhomSanPham).values({
        id: userProductGroupId,
        tenNhomSP: 'Nhóm sản phẩm do người dùng tạo',
        active: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      })
      await db.insert(schema.nhomHangHoa).values({
        id: userGoodsGroupId,
        maNhom: 'USER-NHH',
        tenNhom: 'Nhóm hàng hóa do người dùng tạo',
        active: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      })
      await db
        .update(schema.nhomSanPham)
        .set({ tenNhomSP: 'Điện thoại thông minh', active: false })
        .where(eq(schema.nhomSanPham.id, productGroup.id))
      await db
        .update(schema.nhomHangHoa)
        .set({ maNhom: 'PHONE', tenNhom: 'Điện Thoại', active: false })
        .where(eq(schema.nhomHangHoa.id, goodsGroup.id))
      await db
        .update(schema.sanPham)
        .set({ nhomSanPhamId: null, active: false })
        .where(eq(schema.sanPham.id, product.id))
      await db
        .update(schema.hangHoa)
        .set({ nhomHangHoaId: 'nhh-2' })
        .where(eq(schema.hangHoa.id, goods.id))

      const before = await countSeededTables(db)
      await seedDatabase(db, INITIAL_ADMIN_PASSWORD)
      const after = await countSeededTables(db)
      const seededProductGroups = await db.select().from(schema.nhomSanPham)
      const seededGoodsGroups = await db.select().from(schema.nhomHangHoa)
      const seededProducts = await db.select().from(schema.sanPham)
      const seededGoods = await db.select().from(schema.hangHoa)
      const [userProductGroup] = await db
        .select()
        .from(schema.nhomSanPham)
        .where(eq(schema.nhomSanPham.id, userProductGroupId))
      const [userGoodsGroup] = await db
        .select()
        .from(schema.nhomHangHoa)
        .where(eq(schema.nhomHangHoa.id, userGoodsGroupId))

      expect(after).toEqual(before)
      const productGroupById = new Map(
        seededProductGroups.map((row) => [row.id, row]),
      )
      const goodsGroupById = new Map(
        seededGoodsGroups.map((row) => [row.id, row]),
      )
      const productById = new Map(seededProducts.map((row) => [row.id, row]))
      const goodsById = new Map(seededGoods.map((row) => [row.id, row]))
      for (const row of fixtures.nhomSanPham) {
        expect(productGroupById.get(row.id)).toMatchObject({
          id: row.id,
          tenNhomSP: row.tenNhomSP,
          active: row.active,
        })
      }
      for (const row of fixtures.nhomHangHoa) {
        expect(goodsGroupById.get(row.id)).toMatchObject({
          id: row.id,
          maNhom: row.maNhom,
          tenNhom: row.tenNhom,
          active: row.active,
        })
      }
      for (const row of fixtures.sanPham) {
        expect(productById.get(row.id)).toMatchObject({
          id: row.id,
          nhomSanPhamId: row.nhomSanPhamId,
          active: row.active,
        })
      }
      for (const row of fixtures.hangHoa) {
        expect(goodsById.get(row.id)).toMatchObject({
          id: row.id,
          nhomHangHoaId: row.nhomHangHoaId,
        })
      }
      expect(userProductGroup.tenNhomSP).toBe('Nhóm sản phẩm do người dùng tạo')
      expect(userGoodsGroup.tenNhom).toBe('Nhóm hàng hóa do người dùng tạo')
    } finally {
      await db
        .update(schema.nhomSanPham)
        .set({ tenNhomSP: productGroup.tenNhomSP, active: productGroup.active })
        .where(eq(schema.nhomSanPham.id, productGroup.id))
      await db
        .update(schema.nhomHangHoa)
        .set({
          maNhom: goodsGroup.maNhom,
          tenNhom: goodsGroup.tenNhom,
          active: goodsGroup.active,
        })
        .where(eq(schema.nhomHangHoa.id, goodsGroup.id))
      await db
        .update(schema.sanPham)
        .set({
          nhomSanPhamId: product.nhomSanPhamId,
          active: product.active,
        })
        .where(eq(schema.sanPham.id, product.id))
      await db
        .update(schema.hangHoa)
        .set({ nhomHangHoaId: goods.nhomHangHoaId })
        .where(eq(schema.hangHoa.id, goods.id))
      await db
        .delete(schema.nhomSanPham)
        .where(eq(schema.nhomSanPham.id, userProductGroupId))
      await db
        .delete(schema.nhomHangHoa)
        .where(eq(schema.nhomHangHoa.id, userGoodsGroupId))
      await pool.end()
    }
  })
})

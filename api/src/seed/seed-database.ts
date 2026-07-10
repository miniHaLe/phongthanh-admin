/** Reusable seed routine (shared by the CLI runner `run-seed.ts` and the e2e
 * test global-setup). Imports the frozen fixtures in FK order, preserves ids,
 * `ON CONFLICT (id) DO NOTHING`, derives `khach_hang.branch_id` from `tinhId`
 * (D4), and stamps the super-admin (V4). Idempotent. */
import bcrypt from 'bcryptjs'
import type { DbClient } from '../db/client'
import * as schema from '../db/schema'
import { branchIdForTinh } from './branch-map'
import { loadFixtures } from './load-fixtures'
import { validateFkClosure } from './validate-fk-closure'

const SUPER_ADMIN_LOGIN = 'admin'
const BCRYPT_ROUNDS = 12

export interface SeedResult {
  chiNhanh: number
  tinh: number
  quan: number
  xa: number
  loaiKhachHang: number
  nhomQuyen: number
  nguoiDung: number
  khachHang: number
}

export async function seedDatabase(
  db: DbClient,
  initialAdminPassword: string,
): Promise<SeedResult> {
  const fixtures = loadFixtures()

  validateFkClosure({
    tinhIds: new Set(fixtures.tinh.map((t) => t.id)),
    quan: fixtures.quan,
    xa: fixtures.xa,
    chiNhanhIds: new Set(fixtures.chiNhanh.map((c) => c.id)),
    nhomQuyenIds: new Set(fixtures.nhomQuyen.map((n) => n.id)),
    loaiKhachHangIds: new Set(fixtures.loaiKhachHang.map((l) => l.id)),
    nguoiDung: fixtures.nguoiDung,
    khachHang: fixtures.khachHang,
  })

  // FK order: chi_nhanh, tinh, quan, xa, loai_khach_hang, nhom_quyen,
  // nguoi_dung, khach_hang.
  if (fixtures.chiNhanh.length > 0) {
    await db
      .insert(schema.chiNhanh)
      .values(
        fixtures.chiNhanh.map((c) => ({
          id: c.id,
          tenChiNhanh: c.tenChiNhanh,
          soDienThoai: c.soDienThoai,
          hotline: c.hotline,
          nguoiLienHe: c.nguoiLienHe,
          email: c.email,
          diaChi: c.diaChi,
          toaDo: c.toaDo,
          chinh: c.chinh,
          chuyenCn: c.chuyenCn,
          active: c.active,
          createdAt: new Date(c.createdAt),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
        })),
      )
      .onConflictDoNothing({ target: schema.chiNhanh.id })
  }

  if (fixtures.tinh.length > 0) {
    await db
      .insert(schema.tinh)
      .values(fixtures.tinh)
      .onConflictDoNothing({ target: schema.tinh.id })
  }

  if (fixtures.quan.length > 0) {
    await db
      .insert(schema.quan)
      .values(fixtures.quan)
      .onConflictDoNothing({ target: schema.quan.id })
  }

  if (fixtures.xa.length > 0) {
    await db
      .insert(schema.xa)
      .values(
        fixtures.xa.map((x) => ({
          id: x.id,
          ten: x.ten,
          quanId: x.quanId,
          tinhId: x.tinhId,
          khoangCach: x.khoangCach,
          tienCong: x.tienCong,
          tuyenId: x.tuyenId,
        })),
      )
      .onConflictDoNothing({ target: schema.xa.id })
  }

  if (fixtures.loaiKhachHang.length > 0) {
    await db
      .insert(schema.loaiKhachHang)
      .values(fixtures.loaiKhachHang)
      .onConflictDoNothing({ target: schema.loaiKhachHang.id })
  }

  if (fixtures.nhomQuyen.length > 0) {
    await db
      .insert(schema.nhomQuyen)
      .values(
        fixtures.nhomQuyen.map((n) => ({
          id: n.id,
          maNhom: n.maNhom,
          tenNhom: n.tenNhom,
          moTa: n.moTa,
          active: n.active,
          createdAt: new Date(n.createdAt),
          updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
        })),
      )
      .onConflictDoNothing({ target: schema.nhomQuyen.id })
  }

  if (fixtures.nguoiDung.length > 0) {
    // Every seeded user gets a password from INITIAL_ADMIN_PASSWORD + forced
    // change on first login (V4) — none have a real password in the source
    // fixture (it's UI-only mock data). Super-scope is stamped by login name,
    // NOT derived from the mock's random nhomQuyenId.
    const passwordHash = await bcrypt.hash(initialAdminPassword, BCRYPT_ROUNDS)
    await db
      .insert(schema.nguoiDung)
      .values(
        fixtures.nguoiDung.map((nd) => ({
          id: nd.id,
          tenDangNhap: nd.tenDangNhap,
          hoTen: nd.hoTen,
          dienThoai: nd.dienThoai,
          email: nd.email,
          chiNhanhId: nd.chiNhanhId,
          chiNhanhPhuIds: nd.chiNhanhPhuIds ?? [],
          nhomQuyenId: nd.nhomQuyenId,
          superScope: nd.tenDangNhap === SUPER_ADMIN_LOGIN,
          locked: nd.locked ?? false,
          lastLogin: nd.lastLogin ? new Date(nd.lastLogin) : undefined,
          passwordHash,
          mustChangePassword: true,
          active: nd.active,
          createdAt: new Date(nd.createdAt),
          updatedAt: nd.updatedAt ? new Date(nd.updatedAt) : undefined,
        })),
      )
      .onConflictDoNothing({ target: schema.nguoiDung.id })
  }

  if (fixtures.khachHang.length > 0) {
    await db
      .insert(schema.khachHang)
      .values(
        fixtures.khachHang.map((kh) => ({
          id: kh.id,
          tenKH: kh.tenKH,
          dienThoai: kh.dienThoai,
          dienThoai2: kh.dienThoai2,
          diaChi: kh.diaChi,
          phuongXaId: kh.phuongXaId,
          quanId: kh.quanId,
          tinhId: kh.tinhId,
          email: kh.email,
          loaiKhachHangId: kh.loaiKhachHangId,
          daiLyId: kh.daiLyId,
          nguoiTao: kh.nguoiTao,
          ghiChu: kh.ghiChu,
          branchId: branchIdForTinh(kh.tinhId),
          active: kh.active,
          createdAt: new Date(kh.createdAt),
          updatedAt: kh.updatedAt ? new Date(kh.updatedAt) : undefined,
        })),
      )
      .onConflictDoNothing({ target: schema.khachHang.id })
  }

  return {
    chiNhanh: fixtures.chiNhanh.length,
    tinh: fixtures.tinh.length,
    quan: fixtures.quan.length,
    xa: fixtures.xa.length,
    loaiKhachHang: fixtures.loaiKhachHang.length,
    nhomQuyen: fixtures.nhomQuyen.length,
    nguoiDung: fixtures.nguoiDung.length,
    khachHang: fixtures.khachHang.length,
  }
}

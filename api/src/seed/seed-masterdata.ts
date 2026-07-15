import type { DbClient } from '../db/client'
import * as schema from '../db/schema'
import type { SeedFixtures } from './load-fixtures'
import { mapCatalogId, type CatalogIdMaps } from './seed-catalog-tables'

function baseValues(row: {
  id: string
  active: boolean
  createdAt: string
  updatedAt?: string
}) {
  return {
    id: row.id,
    active: row.active,
    createdAt: new Date(row.createdAt),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
  }
}

export async function seedMasterdataTables(
  db: DbClient,
  fixtures: SeedFixtures,
  catalogIdMaps: CatalogIdMaps,
) {
  if (fixtures.donViTinh.length > 0) {
    await db
      .insert(schema.donViTinh)
      .values(
        fixtures.donViTinh.map((row) => ({
          ...baseValues(row),
          tenDVT: row.tenDVT,
        })),
      )
      .onConflictDoNothing({ target: schema.donViTinh.id })
  }

  if (fixtures.nhomSanPham.length > 0) {
    await db
      .insert(schema.nhomSanPham)
      .values(
        fixtures.nhomSanPham.map((row) => ({
          ...baseValues(row),
          tenNhomSP: row.tenNhomSP,
        })),
      )
      .onConflictDoNothing({ target: schema.nhomSanPham.id })
  }

  if (fixtures.nhomHangHoa.length > 0) {
    await db
      .insert(schema.nhomHangHoa)
      .values(
        fixtures.nhomHangHoa.map((row) => ({
          ...baseValues(row),
          maNhom: row.maNhom,
          tenNhom: row.tenNhom,
        })),
      )
      .onConflictDoNothing({ target: schema.nhomHangHoa.id })
  }

  if (fixtures.thoiHan.length > 0) {
    await db
      .insert(schema.thoiHan)
      .values(
        fixtures.thoiHan.map((row) => ({
          ...baseValues(row),
          ten: row.ten,
          loai: row.loai,
          thoiGian: row.thoiGian,
        })),
      )
      .onConflictDoNothing({ target: schema.thoiHan.id })
  }

  if (fixtures.nhaKho.length > 0) {
    await db
      .insert(schema.nhaKho)
      .values(
        fixtures.nhaKho.map((row) => ({
          ...baseValues(row),
          maNhaKho: row.maNhaKho,
          tenNhaKho: row.tenNhaKho,
          chiNhanhId: row.chiNhanhId,
          diaChi: row.diaChi,
          khoXac: row.khoXac,
        })),
      )
      .onConflictDoNothing({ target: schema.nhaKho.id })
  }

  if (fixtures.legacyPhuongXa.length > 0) {
    await db
      .insert(schema.phuongXaLegacy)
      .values(
        fixtures.legacyPhuongXa.map((row) => ({
          ...baseValues(row),
          tenPhuongXa: row.tenPhuongXa,
          tinhId: row.tinhId,
          quanId: row.quanId,
          khoangCach: row.khoangCach,
          tienCong: row.tienCong,
          tuyenId: row.tuyenId,
        })),
      )
      .onConflictDoNothing({ target: schema.phuongXaLegacy.id })
  }

  if (fixtures.khuVuc.length > 0) {
    await db
      .insert(schema.khuVuc)
      .values(
        fixtures.khuVuc.map((row) => ({
          ...baseValues(row),
          tenKhuVuc: row.tenKhuVuc,
          tinhId: row.tinhId,
          quanId: row.quanId,
          xaId: row.xaId,
          caySo: row.caySo,
          tienCong: row.tienCong,
          tienCong2: row.tienCong2,
        })),
      )
      .onConflictDoNothing({ target: schema.khuVuc.id })
  }

  if (fixtures.loiSuaChua.length > 0) {
    await db
      .insert(schema.loiSuaChua)
      .values(
        fixtures.loiSuaChua.map((row) => ({
          ...baseValues(row),
          branchId: row.branchId,
          nhomSanPhamId: row.nhomSanPhamId,
          tenLoi: row.tenLoi,
          tienCong: row.tienCong,
          tienCongDV: row.tienCongDV,
        })),
      )
      .onConflictDoNothing({ target: schema.loiSuaChua.id })
  }

  if (fixtures.nganChua.length > 0) {
    await db
      .insert(schema.nganChua)
      .values(
        fixtures.nganChua.map((row) => ({
          ...baseValues(row),
          tenNgan: row.tenNgan,
          nhaKhoId: row.nhaKhoId,
        })),
      )
      .onConflictDoNothing({ target: schema.nganChua.id })
  }

  if (fixtures.phiGiao.length > 0) {
    await db
      .insert(schema.phiGiao)
      .values(
        fixtures.phiGiao.map((row) => ({
          ...baseValues(row),
          sanPhamId: mapCatalogId(catalogIdMaps.sanPham, row.sanPhamId),
          tenPhi: row.tenPhi,
          soTien: row.soTien,
          loaiPhi: row.loaiPhi,
          ghiChu: row.ghiChu,
        })),
      )
      .onConflictDoNothing({ target: schema.phiGiao.id })
  }

  if (fixtures.hangHoa.length > 0) {
    await db
      .insert(schema.hangHoa)
      .values(
        fixtures.hangHoa.map((row) => ({
          ...baseValues(row),
          maHH: row.maHH,
          maHHPhu: row.maHHPhu,
          tenHH: row.tenHH,
          tenTiengAnh: row.tenTiengAnh,
          nhomHangHoaId: row.nhomHangHoaId,
          nhaSanXuatId: mapCatalogId(
            catalogIdMaps.nhaSanXuat,
            row.nhaSanXuatId,
          ),
          modelId: mapCatalogId(catalogIdMaps.model, row.modelId),
          modelDungChung: row.modelDungChung,
          modelDungChungText: row.modelDungChungText,
          donViTinhId: row.donViTinhId,
          coSerial: row.coSerial,
          phatSinhTuDong: row.phatSinhTuDong,
          viTriLinhKien: row.viTriLinhKien,
          hinh: row.hinh,
          giaMua: row.giaMua,
          giaBanSi: row.giaBanSi,
          giaBanLe: row.giaBanLe,
          nguoiTao: row.nguoiTao,
          giaNhap: row.giaNhap,
          giaBan: row.giaBan,
          tonKho: row.tonKho,
        })),
      )
      .onConflictDoNothing({ target: schema.hangHoa.id })
  }

  return {
    donViTinh: fixtures.donViTinh.length,
    nhomSanPham: fixtures.nhomSanPham.length,
    nhomHangHoa: fixtures.nhomHangHoa.length,
    thoiHan: fixtures.thoiHan.length,
    nhaKho: fixtures.nhaKho.length,
    legacyPhuongXa: fixtures.legacyPhuongXa.length,
    khuVuc: fixtures.khuVuc.length,
    loiSuaChua: fixtures.loiSuaChua.length,
    nganChua: fixtures.nganChua.length,
    phiGiao: fixtures.phiGiao.length,
    hangHoa: fixtures.hangHoa.length,
  }
}

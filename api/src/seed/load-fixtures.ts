/** Loads the FROZEN seed fixtures (`api/seed-fixtures/*.json`) — consumed
 * as-is, never re-derived (plan D5). Typed loosely on purpose: the fixture
 * shape is validated structurally by the FK-closure check in `run-seed.ts`,
 * not by a schema here (YAGNI — one-shot seed data, not a runtime API). */
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const FIXTURES_DIR = join(__dirname, '../../seed-fixtures')

function loadJson<T>(file: string): T {
  const raw = readFileSync(join(FIXTURES_DIR, file), 'utf-8')
  return JSON.parse(raw) as T
}

function sha256(file: string): string {
  return createHash('sha256')
    .update(readFileSync(join(FIXTURES_DIR, file)))
    .digest('hex')
}

export interface ChiNhanhFixture {
  id: string
  tenChiNhanh: string
  soDienThoai?: string
  hotline?: string
  nguoiLienHe?: string
  email?: string
  diaChi?: string
  toaDo?: string
  chinh?: boolean
  chuyenCn?: boolean
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface TinhFixture {
  id: string
  ten: string
}

export interface QuanFixture {
  id: string
  ten: string
  tinhId: string
}

export interface XaFixture {
  id: string
  ten: string
  quanId: string
  tinhId: string
  khoangCach?: number
  tienCong?: number
  tuyenId?: string
}

export interface LoaiKhachHangFixture {
  id: number
  ten: string
}

export interface NhomQuyenFixture {
  id: string
  maNhom: string
  tenNhom: string
  moTa?: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface NguoiDungFixture {
  id: string
  tenDangNhap: string
  hoTen: string
  dienThoai?: string
  email?: string
  chiNhanhId: string
  chiNhanhPhuIds?: string[]
  nhomQuyenId: string
  locked?: boolean
  lastLogin?: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface KhachHangFixture {
  id: string
  tenKH: string
  dienThoai: string
  dienThoai2?: string
  diaChi?: string
  tinhThanhCode?: string
  phuongXaCode?: string
  phuongXaId?: string
  quanId?: string
  tinhId?: string
  email?: string
  loaiKhachHangId: number
  daiLyId?: string
  nguoiTao: string
  ghiChu?: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface CatalogFixtureBase {
  id: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface NhaSanXuatFixture extends CatalogFixtureBase {
  maNSX?: string
  tenNSX: string
  ghiChu?: string
}

export interface SanPhamFixture extends CatalogFixtureBase {
  maSP?: string
  tenSP: string
  nhomSanPhamId?: string
  tienKhoan?: number
}

export interface ModelFixture extends CatalogFixtureBase {
  tenModel: string
  tenModelNormalized: string
  nhaSanXuatId: string
  sanPhamId: string
  ghiChu?: string
}

export interface NganHangFixture extends CatalogFixtureBase {
  maNganHang: string
  tenNganHang: string
  diaChi?: string
}

export interface TinhThanhFixture {
  code: string
  name: string
  type: string
  normalizedName: string
}

export interface PhuongXaFixture extends TinhThanhFixture {
  provinceCode: string
}

export interface DiaLyMetadataFixture {
  version: string
  effectiveFrom: string
  sourceDocument: string
  officialSourceUrl: string
  counts: { provinces: number; communes: number }
  checksums: { provincesSha256: string; communesSha256: string }
}

export function loadFixtures() {
  const diaLyMetadata = loadJson<DiaLyMetadataFixture>('dia-ly-metadata.json')
  const actualProvinceChecksum = sha256('tinh-thanh.json')
  const actualCommuneChecksum = sha256('phuong-xa-2025.json')
  if (
    actualProvinceChecksum !== diaLyMetadata.checksums.provincesSha256 ||
    actualCommuneChecksum !== diaLyMetadata.checksums.communesSha256
  ) {
    throw new Error('Official geography fixture checksum mismatch')
  }

  return {
    chiNhanh: loadJson<ChiNhanhFixture[]>('chi-nhanh.json'),
    tinh: loadJson<TinhFixture[]>('tinh.json'),
    quan: loadJson<QuanFixture[]>('quan.json'),
    xa: loadJson<XaFixture[]>('xa.json'),
    loaiKhachHang: loadJson<LoaiKhachHangFixture[]>('loai-khach-hang.json'),
    nhomQuyen: loadJson<NhomQuyenFixture[]>('nhom-quyen.json'),
    nguoiDung: loadJson<NguoiDungFixture[]>('nguoi-dung.json'),
    khachHang: loadJson<KhachHangFixture[]>('khach-hang.json'),
    nhaSanXuat: loadJson<NhaSanXuatFixture[]>('nha-san-xuat.json'),
    sanPham: loadJson<SanPhamFixture[]>('san-pham.json'),
    model: loadJson<ModelFixture[]>('model.json'),
    nganHang: loadJson<NganHangFixture[]>('ngan-hang.json'),
    tinhThanh: loadJson<TinhThanhFixture[]>('tinh-thanh.json'),
    phuongXa: loadJson<PhuongXaFixture[]>('phuong-xa-2025.json'),
    diaLyMetadata,
  }
}

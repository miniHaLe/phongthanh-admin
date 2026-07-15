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

export interface DonViTinhFixture extends CatalogFixtureBase {
  tenDVT: string
}

export interface NhomSanPhamFixture extends CatalogFixtureBase {
  tenNhomSP: string
}

export interface NhomHangHoaFixture extends CatalogFixtureBase {
  maNhom?: string
  tenNhom: string
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

export interface ThoiHanFixture extends CatalogFixtureBase {
  ten: string
  loai: 'Tháng' | 'Năm'
  thoiGian: number
}

export interface NhaKhoFixture extends CatalogFixtureBase {
  maNhaKho: string
  tenNhaKho: string
  chiNhanhId: string
  diaChi?: string
  khoXac: boolean
}

export interface LegacyPhuongXaFixture extends CatalogFixtureBase {
  tenPhuongXa: string
  tinhId: string
  quanId: string
  khoangCach: number
  tienCong: number
  tuyenId?: string
}

export interface KhuVucFixture extends CatalogFixtureBase {
  tenKhuVuc: string
  tinhId: string
  quanId: string
  xaId: string
  caySo: number
  tienCong: number
  tienCong2: number
}

export interface LoiSuaChuaFixture extends CatalogFixtureBase {
  branchId: string
  nhomSanPhamId: string
  tenLoi: string
  tienCong: number
  tienCongDV: number
}

export interface NganChuaFixture extends CatalogFixtureBase {
  tenNgan: string
  nhaKhoId: string
}

export interface HangHoaFixture extends CatalogFixtureBase {
  maHH: string
  maHHPhu?: string
  tenHH: string
  tenTiengAnh?: string
  nhomHangHoaId: string
  nhaSanXuatId?: string
  modelId?: string
  modelDungChung: boolean
  modelDungChungText?: string
  donViTinhId: string
  coSerial: boolean
  phatSinhTuDong: boolean
  viTriLinhKien?: string
  hinh?: string
  giaMua?: number
  giaBanSi?: number
  giaBanLe?: number
  nguoiTao: string
  giaNhap?: number
  giaBan?: number
  tonKho: number
}

export interface PhiGiaoFixture extends CatalogFixtureBase {
  sanPhamId: string | null
  tenPhi: string
  soTien: number
  loaiPhi: number
  ghiChu?: string
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
    donViTinh: loadJson<DonViTinhFixture[]>('don-vi-tinh.json'),
    nhomSanPham: loadJson<NhomSanPhamFixture[]>('nhom-san-pham.json'),
    nhomHangHoa: loadJson<NhomHangHoaFixture[]>('nhom-hang-hoa.json'),
    nhaSanXuat: loadJson<NhaSanXuatFixture[]>('nha-san-xuat.json'),
    thoiHan: loadJson<ThoiHanFixture[]>('thoi-han.json'),
    nhaKho: loadJson<NhaKhoFixture[]>('nha-kho.json'),
    legacyPhuongXa: loadJson<LegacyPhuongXaFixture[]>('phuong-xa.json'),
    khuVuc: loadJson<KhuVucFixture[]>('khu-vuc.json'),
    loiSuaChua: loadJson<LoiSuaChuaFixture[]>('loi-sua-chua.json'),
    nganChua: loadJson<NganChuaFixture[]>('ngan-chua.json'),
    sanPham: loadJson<SanPhamFixture[]>('san-pham.json'),
    model: loadJson<ModelFixture[]>('model.json'),
    hangHoa: loadJson<HangHoaFixture[]>('hang-hoa.json'),
    phiGiao: loadJson<PhiGiaoFixture[]>('phi-giao.json'),
    nganHang: loadJson<NganHangFixture[]>('ngan-hang.json'),
    tinhThanh: loadJson<TinhThanhFixture[]>('tinh-thanh.json'),
    phuongXa: loadJson<PhuongXaFixture[]>('phuong-xa-2025.json'),
    diaLyMetadata,
  }
}

export type SeedFixtures = ReturnType<typeof loadFixtures>

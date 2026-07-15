/** Loads the FROZEN seed fixtures (`api/seed-fixtures/*.json`) — consumed
 * as-is, never re-derived (plan D5). Typed loosely on purpose: the fixture
 * shape is validated structurally by the FK-closure check in `run-seed.ts`,
 * not by a schema here (YAGNI — one-shot seed data, not a runtime API). */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const FIXTURES_DIR = join(__dirname, '../../seed-fixtures')

function loadJson<T>(file: string): T {
  const raw = readFileSync(join(FIXTURES_DIR, file), 'utf-8')
  return JSON.parse(raw) as T
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

interface BaseMasterdataFixture {
  id: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface DonViTinhFixture extends BaseMasterdataFixture {
  tenDVT: string
}

export interface NhomSanPhamFixture extends BaseMasterdataFixture {
  tenNhomSP: string
}

export interface NhomHangHoaFixture extends BaseMasterdataFixture {
  maNhom?: string
  tenNhom: string
}

export interface NhaSanXuatFixture extends BaseMasterdataFixture {
  maNSX?: string
  tenNSX: string
  ghiChu?: string
}

export interface ThoiHanFixture extends BaseMasterdataFixture {
  ten: string
  loai: 'Tháng' | 'Năm'
  thoiGian: number
}

export interface NhaKhoFixture extends BaseMasterdataFixture {
  maNhaKho: string
  tenNhaKho: string
  chiNhanhId: string
  diaChi?: string
  khoXac: boolean
}

export interface PhuongXaFixture extends BaseMasterdataFixture {
  tenPhuongXa: string
  tinhId: string
  quanId: string
  khoangCach: number
  tienCong: number
  tuyenId?: string
}

export interface KhuVucFixture extends BaseMasterdataFixture {
  tenKhuVuc: string
  tinhId: string
  quanId: string
  xaId: string
  caySo: number
  tienCong: number
  tienCong2: number
}

export interface LoiSuaChuaFixture extends BaseMasterdataFixture {
  branchId: string
  nhomSanPhamId: string
  tenLoi: string
  tienCong: number
  tienCongDV: number
}

export interface NganChuaFixture extends BaseMasterdataFixture {
  tenNgan: string
  nhaKhoId: string
}

export interface SanPhamFixture extends BaseMasterdataFixture {
  maSP?: string
  tenSP: string
  nhomSanPhamId: string
  tienKhoan?: number
}

export interface ModelFixture extends BaseMasterdataFixture {
  tenModel: string
  maModel?: string
  nhaSanXuatId: string
  sanPhamId: string
  nguoiTao: string
  ghiChu?: string
}

export interface HangHoaFixture extends BaseMasterdataFixture {
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

export interface PhiGiaoFixture extends BaseMasterdataFixture {
  sanPhamId: string | null
  tenPhi: string
  soTien: number
  loaiPhi: number
  ghiChu?: string
}

export function loadFixtures() {
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
    phuongXa: loadJson<PhuongXaFixture[]>('phuong-xa.json'),
    khuVuc: loadJson<KhuVucFixture[]>('khu-vuc.json'),
    loiSuaChua: loadJson<LoiSuaChuaFixture[]>('loi-sua-chua.json'),
    nganChua: loadJson<NganChuaFixture[]>('ngan-chua.json'),
    sanPham: loadJson<SanPhamFixture[]>('san-pham.json'),
    model: loadJson<ModelFixture[]>('model.json'),
    hangHoa: loadJson<HangHoaFixture[]>('hang-hoa.json'),
    phiGiao: loadJson<PhiGiaoFixture[]>('phi-giao.json'),
  }
}

export type SeedFixtures = ReturnType<typeof loadFixtures>

/**
 * TypeScript entity types for all Phase 5/6 master-data tables.
 * All extend BaseEntity from @/mock/seed.
 */
import type { BaseEntity } from '@/mock/seed'
import type { BranchId } from '@/mock/seed/branches'

export type { BaseEntity }

export interface KhachHang extends BaseEntity {
  tenKH: string
  dienThoai: string
  dienThoai2?: string | null
  diaChi?: string | null
  /** Street/house component for current two-level Vietnamese addresses. */
  tenDuong?: string | null
  /** Official two-digit province/city code from Decision 19/2025/QD-TTg. */
  tinhThanhCode?: string | null
  /** Official five-digit commune/ward code from Decision 19/2025/QD-TTg. */
  phuongXaCode?: string | null
  /** Xã/Phường — references the P1 Tỉnh→Quận→Xã `XA` lookup id. */
  phuongXaId?: string | null
  /** Quận/Huyện — references `QUAN`. */
  quanId?: string | null
  /** Tỉnh — references `TINH`. */
  tinhId?: string | null
  email?: string | null
  maSoThue?: string | null
  nganHangId?: string | null
  nganHangTen?: string | null
  /** Text by design so leading zeroes survive persistence and export. */
  soTaiKhoan?: string | null
  /** Nhóm khách hàng — 1-9, references LOAI_KHACH_HANG. */
  loaiKhachHangId: number
  /** Đại lý/Trạm — self-referential parent dealer/station KhachHang id. */
  daiLyId?: string | null
  nguoiTao: string
  ghiChu?: string | null
}

export interface Model extends BaseEntity {
  tenModel: string
  maModel?: string
  nhaSanXuatId: string
  sanPhamId: string
  nguoiTao?: string
  ghiChu?: string
}

export interface NhaKho extends BaseEntity {
  maNhaKho: string
  tenNhaKho: string
  chiNhanhId: string
  diaChi?: string
  /** Flags a warehouse as the carcass/dead-unit warehouse (drives Xác inventory). */
  khoXac: boolean
}

export interface NganChua extends BaseEntity {
  tenNgan: string
  nhaKhoId: string
}

export interface NhomHangHoa extends BaseEntity {
  maNhom?: string
  tenNhom: string
}

export interface HangHoa extends BaseEntity {
  maHH: string
  maHHPhu?: string
  tenHH: string
  tenTiengAnh?: string
  nhomHangHoaId: string
  nhaSanXuatId?: string
  modelId?: string
  /** "Dùng chung nhiều model" — item applies to more than one model. */
  modelDungChung: boolean
  /** Free-text model list shown when modelDungChung is set (e.g. "RAS-F10CJV, RAS-F13CJV"). */
  modelDungChungText?: string
  donViTinhId: string
  coSerial: boolean
  phatSinhTuDong: boolean
  viTriLinhKien?: string
  hinh?: string
  /** Giá mua */
  giaMua?: number
  /** Giá bán sỉ */
  giaBanSi?: number
  /** Giá bán lẻ */
  giaBanLe?: number
  nguoiTao: string
  /** Legacy fields kept for the inventory/warehouse/stock-out layers (other
   * phases) that still read cost/sale price + on-hand qty off this entity —
   * additive, not reference-verified list columns. */
  giaNhap?: number
  giaBan?: number
  tonKho: number
}

export interface NhaSanXuat extends BaseEntity {
  maNSX?: string
  tenNSX: string
  ghiChu?: string
}

export interface SanPham extends BaseEntity {
  maSP?: string
  tenSP: string
  nhomSanPhamId: string
  /** Tiền khoán — piecework amount feeding technician KPI workflows. */
  tienKhoan?: number
}

/**
 * Khu vực = delivery route entity on the Tỉnh→Quận→Xã hierarchy (re-modeled,
 * Finding 2). Seeded from the P1 `TUYEN` lookup (mock/seed/tinh-quan-xa.ts) —
 * that array is the fixture data behind this live, mutable CRUD table.
 */
export interface KhuVuc extends BaseEntity {
  tenKhuVuc: string
  tinhId: string
  quanId: string
  xaId: string
  caySo: number
  tienCong: number
  tienCong2: number
}

/** Phường/Xã — seeded from the P1 `XA` lookup (mock/seed/tinh-quan-xa.ts). */
export interface PhuongXa extends BaseEntity {
  tenPhuongXa: string
  tinhId: string
  quanId: string
  khoangCach: number
  tienCong: number
  /** Tuyến — optional link to a KhuVuc (route) row. */
  tuyenId?: string
}

export interface ThoiHan extends BaseEntity {
  ten: string
  loai: 'Tháng' | 'Năm'
  thoiGian: number
}

/**
 * Phí giao — linked to Sản phẩm (product-type/appliance, NOT Khu vực).
 * `sanPhamId` references the P1 `SAN_PHAM` appliance lookup (reference-data.ts).
 */
export interface PhiGiao extends BaseEntity {
  sanPhamId: string | null
  tenPhi: string
  soTien: number
  /** 1 Cộng / 2 Trừ / 3 Công. */
  loaiPhi: number
  ghiChu?: string
}

export interface DonViTinh extends BaseEntity {
  tenDVT: string
}

export interface NhomSanPham extends BaseEntity {
  tenNhomSP: string
}

/**
 * Lỗi sửa chữa — labor-price catalog per (branch × product group × repair).
 * `nhomSanPhamId` references the P1 reference-data `NHOM_SAN_PHAM` lookup
 * (the same universe LOI_SUA_CHUA_GIA was seeded against).
 */
export interface LoiSuaChua extends BaseEntity {
  branchId: BranchId
  nhomSanPhamId: string
  tenLoi: string
  tienCong: number
  tienCongDV: number
}

export interface ChiNhanh extends BaseEntity {
  tenChiNhanh: string
  soDienThoai?: string
  hotline?: string
  nguoiLienHe?: string
  email?: string
  diaChi?: string
  /** Toạ độ — "lat, lng" (reference tooltip: 21.029743, 105.833882). */
  toaDo?: string
  /** Chi nhánh chính (read-only checkbox column). */
  chinh?: boolean
  /** Chuyển chi nhánh — allow transfers (default true). */
  chuyenCn?: boolean
}

export interface NguoiDung extends BaseEntity {
  tenDangNhap: string
  hoTen: string
  dienThoai?: string
  email?: string
  chiNhanhId: string
  /** Secondary branches this user can also access. */
  chiNhanhPhuIds?: string[]
  nhomQuyenId: string
  /** Account lock state (Khóa / Mở khóa toggle). */
  locked?: boolean
  lastLogin?: string
  password?: string
}

/** true = Nam, false = Nữ (reference stores GioiTinh as a boolean). */
export type GioiTinh = boolean

export interface NhanVien extends BaseEntity {
  maNV: string
  hoTen: string
  gioiTinh?: GioiTinh
  /** Photo URL/data-URI shown as the 40x40 list thumbnail + editor preview. */
  photo?: string
  ngaySinh?: string
  soDienThoai?: string
  soDienThoai2?: string
  email?: string
  thuongTru?: string
  chiNhanhId: string
  phongBanId: string
  chucVuId: string
  /** ISO date the employee started (`Ngày Làm Việc`). */
  ngayLamViec?: string
  luongCoBan?: number
  /** Technician piece-rate fee (`Phí nhân công` / HeSo) — feeds Công BH/Công SC. */
  phiNhanCong?: number
  hinhThucThanhToan?: 'Tiền mặt' | 'Chuyển khoản'
  tienBaoHiem?: number
  /** Phụ cấp ids (from the Phụ Cấp master list) assigned to this employee. */
  phuCapIds?: string[]
  cmnd?: string
  ngayCap?: string
  diaChi?: string
  noiCap?: string
  soTaiKhoan?: string
  maSoThue?: string
  nganHangId?: string
  nguoiLienHe?: string
  thongTinLienHe?: string
  ghiChu?: string
  /** Account lock state — true = locked (reference `data-lock="True"`). */
  locked?: boolean
}

export interface PhongBan extends BaseEntity {
  maPhongBan: string
  tenPhongBan: string
}

export interface ChucVu extends BaseEntity {
  maChucVu: string
  tenChucVu: string
  moTa?: string
}

export interface NhomQuyen extends BaseEntity {
  maNhom: string
  tenNhom: string
  moTa?: string
}

export interface Menu extends BaseEntity {
  tenMenu: string
  duongDan: string
  thuTu: number
  parentId?: string
  icon?: string
}

export interface ChucNang extends BaseEntity {
  tenChucNang: string
  maChucNang: string
  menuId: string
  /** Parent entity-group ChucNang id — undefined for a top-level group.
   * Hierarchical entity-group → action-leaf taxonomy (e.g. "Chi nhánh" group
   * → Xem/Thêm/Sửa/Xóa leaves) backing the Menu function-permission matrix. */
  parentId?: string
  moTa?: string
}

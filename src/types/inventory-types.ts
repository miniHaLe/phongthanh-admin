/**
 * Inventory domain types — Phase 6.
 * NhapKho, TonKho, CapLinhKien, BanHang, TraHang, ChuyenKho, InventoryKpi.
 */

export interface TonKho {
  id: string
  hang_hoa_id: string
  ma_hang: string
  ten_hang: string
  nhom: string
  dvt: string
  kho_id: string
  ton_dau_ky: number
  nhap_trong_ky: number
  xuat_trong_ky: number
  ton_cuoi_ky: number
  gia_tri: number
  createdAt: string
  updatedAt?: string
  active: boolean
}

export interface NhapKhoItem {
  hang_hoa_id: string
  ten: string
  so_luong: number
  don_gia: number
}

export type TrangThaiNhapKho = 'Cho duyet' | 'Da duyet'

export interface NhapKho {
  id: string
  ma: string
  kho_id: string
  kho_ten: string
  nha_cung_cap: string
  ngay_nhap: string
  items: NhapKhoItem[]
  tong_tien: number
  nguoi_tao: string
  trang_thai: TrangThaiNhapKho
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

export interface CapLinhKienItem {
  hang_hoa_id: string
  ten: string
  so_luong: number
  don_gia: number
}

export interface CapLinhKien {
  id: string
  ma: string
  phieu_sc_id: string
  phieu_sc_ma: string
  ky_thuat_vien: string
  ngay_cap: string
  items: CapLinhKienItem[]
  tong_tien: number
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

export interface BanHangItem {
  hang_hoa_id: string
  ten: string
  so_luong: number
  don_gia: number
}

export type TrangThaiBanHang = 'Cho xac nhan' | 'Da xuat' | 'Huy'

export interface BanHang {
  id: string
  ma: string
  khach_hang_id: string
  khach_hang_ten: string
  ngay_ban: string
  items: BanHangItem[]
  tong_tien: number
  trang_thai: TrangThaiBanHang
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

export interface TraHangItem {
  hang_hoa_id: string
  ten: string
  so_luong: number
  don_gia: number
}

export interface TraHang {
  id: string
  ma: string
  ban_hang_id: string
  khach_hang_ten: string
  ngay_tra: string
  ly_do: string
  items: TraHangItem[]
  tong_tien_hoan: number
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

export interface ChuyenKhoItem {
  hang_hoa_id: string
  ten: string
  so_luong: number
}

export type TrangThaiChuyenKho = 'Cho xac nhan' | 'Hoan thanh' | 'Huy'

export interface ChuyenKho {
  id: string
  ma: string
  kho_nguon_id: string
  kho_nguon_ten: string
  kho_dich_id: string
  kho_dich_ten: string
  nhan_vien: string
  ngay_chuyen: string
  items: ChuyenKhoItem[]
  trang_thai: TrangThaiChuyenKho
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

/** Parts recovery record — linh kiện thu hồi từ thiết bị */
export interface ThuHoiLK {
  id: string
  ma: string
  phieu_sc_id: string
  phieu_sc_ma: string
  ky_thuat_vien: string
  ngay_thu_hoi: string
  items: { hang_hoa_id: string; ten: string; so_luong: number }[]
  ghi_chu: string
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

export type TrangThaiTraLK = 'Cho xac nhan' | 'Da tra' | 'Huy'

/** Parts return list — danh sách trả linh kiện */
export interface DsTraLK {
  id: string
  ma: string
  cap_lk_id: string
  cap_lk_ma: string
  ky_thuat_vien: string
  ngay_tra: string
  items: { hang_hoa_id: string; ten: string; so_luong: number }[]
  ly_do: string
  trang_thai: TrangThaiTraLK
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

export interface InventoryKpi {
  period: { from: string; to: string }
  kho_id: string | null
  ton_dau_ky: number
  tong_tien_ton: number
  tong_ton: number
}

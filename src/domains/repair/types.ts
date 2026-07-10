/**
 * Repair-domain TypeScript types.
 * RepairStatusId is imported from the canonical C2 module — never redefined here.
 */
import type { RepairStatusId } from '@/domains/repair/status'

// Re-export for convenience — consumers can import from either location.
export type { RepairStatusId }

/**
 * Reference "Hình thức chung" taxonomy (Finding 4 — P3 owns; P4 consumes).
 * The legacy screen offers exactly three: Bảo hành / Sửa dịch vụ / BH sửa chữa.
 */
export type HinhThuc = 'bao_hanh' | 'sua_dich_vu' | 'bh_sua_chua'

export const HINH_THUC_LABEL: Record<HinhThuc, string> = {
  bao_hanh: 'Bảo hành',
  sua_dich_vu: 'Sửa dịch vụ',
  bh_sua_chua: 'BH sửa chữa',
}

/**
 * Warranty location — the Index_8 filter labels (Tại Trạm / Nhà Khách). The
 * Create form (P4) shows its own labels for the same 0|1 field (see plan V7 /
 * phase-03 Unresolved #7); do not unify.
 */
export type LoaiBaoHanh = 'tai_tram' | 'nha_khach'

export const LOAI_BAO_HANH_LABEL: Record<LoaiBaoHanh, string> = {
  tai_tram: 'Tại Trạm',
  nha_khach: 'Nhà Khách',
}

export interface Customer {
  id: string
  ten: string
  sdt: string
  diaChi: string
  tinh: string
  huyen: string
  tuyen?: string
  daiLy?: string
}

export interface Manufacturer {
  id: string
  ten: string
}

export interface Product {
  id: string
  ten: string
  nhaSanXuatId: string
}

export interface Model {
  id: string
  ten: string
  productId: string
}

export interface Technician {
  id: string
  ten: string
  branchId: string
}

export interface LoiSuaChua {
  id: string
  ten: string
}

export interface RepairPart {
  hangHoaId: string
  ten: string
  soLuong: number
  donGia: number
  thanhTien: number
}

export interface StatusHistoryEntry {
  status: RepairStatusId
  changedAt: string // ISO
  changedBy: string // technician name
  note?: string
  gia?: number
  noiDungSC?: string
}

/** A photo/video attached to a ticket. */
export interface TicketMedia {
  id: string
  url: string
  kind: 'image' | 'video'
}

/** Nhật ký điều phối kỹ thuật viên row. */
export interface DispatchLogEntry {
  kyThuat: string
  ngayTao: string // ISO
  nguoiTao: string
  tienCong: number
  tinhTrang: RepairStatusId
  ngayHuy?: string
  nguoiHuy?: string
}

/** Danh sách cấp linh kiện row. */
export interface PartsIssueEntry {
  id: string
  ten: string
  soLuong: number
  ngayCap: string // ISO
  nguoiCap: string
}

/** Danh sách trả linh kiện row. */
export interface PartsReturnEntry {
  id: string
  ten: string
  soLuong: number
  ngayTra: string // ISO
  nguoiTra: string
}

/** Nhật ký chuyển chi nhánh row. */
export interface BranchTransferEntry {
  tuChiNhanh: string
  denChiNhanh: string
  ngayChuyen: string // ISO
  nguoiChuyen: string
  ghiChu?: string
}

export interface RepairTicket {
  id: string // e.g. "PSC-226297"
  soPhieu: string // display ticket number
  soPhieuHang?: string
  soPhieuDaiLy?: string
  soSerial?: string
  branchId: string
  hinhThuc: HinhThuc
  loaiBaoHanh?: LoaiBaoHanh
  tinhTrang: RepairStatusId
  /** Seeded SLA-overdue flag (no wall clock — overdue is data, not derivation). */
  isOverdue: boolean
  /** Sửa gấp (rush) flag. */
  isQuick?: boolean
  khuVuc?: string
  daiLy?: string
  /** Repeat-repair serial flag → red serial highlight. */
  laMayDaSua?: boolean
  kyId?: string
  giaBaoGia?: number
  cachGiaiQuyet?: string
  ngayGiao?: string // ISO — Giao máy
  ngaySuaXong?: string // ISO — Sửa xong
  // Detail/create reference fields (P4)
  noiDungSuaChua?: string
  phuKienKemTheo?: string
  ngayMua?: string // ISO
  noiMua?: string
  /** Warranty location toggle: 0 = Tại TTBH, 1 = Tại Nhà. */
  warrantyAt?: 0 | 1
  images?: TicketMedia[]
  dispatchLog?: DispatchLogEntry[]
  partsIssued?: PartsIssueEntry[]
  partsReturned?: PartsReturnEntry[]
  branchTransferLog?: BranchTransferEntry[]
  khachHangId: string
  khachHang: Customer // embedded snapshot
  nhaSanXuatId: string
  sanPhamId: string
  modelId: string
  tenSanPham: string // display string
  kyThuatId: string
  kyThuat: string // technician name snapshot
  moTaLoi: string
  loiSuaChua: string[] // array of loi ids
  chiPhiDuKien: number
  chiPhiThucTe: number
  chiPhiLinhKien: number
  chiPhiNhanCong: number
  ghiChu?: string
  nguoiNhan: string
  ngayNhan: string // ISO
  ngayHenTra?: string // ISO — promised return date
  ngayHoanThanh?: string // ISO
  statusHistory: StatusHistoryEntry[]
  parts: RepairPart[]
  createdAt: string
  updatedAt: string
}

/** Which date field the from/to range applies to (reference DateType select). */
export type DateType = 'nhan' | 'giao' | 'sua_xong' | 'hoan_thanh'

export interface RepairListFilters {
  branchId?: string
  /** Single legacy status id (Index_8 single-select). */
  tinhTrang?: RepairStatusId
  hinhThuc?: HinhThuc[]
  nhaSanXuatId?: string
  sanPhamId?: string
  modelId?: string
  soPhieu?: string
  soPhieuHang?: string
  soSerial?: string
  tenKhachHang?: string
  khachHangId?: string
  sdt?: string
  kyThuatId?: string
  tinh?: string
  huyen?: string
  tuyen?: string
  daiLy?: string
  loaiBaoHanh?: LoaiBaoHanh
  diaChi?: string
  kyId?: string
  suaGap?: boolean
  dateType?: DateType
  dateFrom?: string // ISO date
  dateTo?: string
}

export interface RepairListParams extends RepairListFilters {
  page: number
  pageSize: number
  sortField?: keyof RepairTicket
  sortDir?: 'asc' | 'desc'
}

export interface RepairListResult {
  data: RepairTicket[]
  total: number
  page: number
  pageSize: number
  /** Count per legacy status id over rows matching all filters except status. */
  statusCounts: Record<number, number>
}

/** Input type for creating a new repair ticket. */
export interface CreateRepairInput {
  khachHangId?: string // existing customer
  tenKhach: string // or new customer
  sdt: string
  diaChi?: string
  branchId: string
  nhaSanXuatId: string
  sanPhamId: string
  modelId: string
  soSerial?: string
  loaiBaoHanh?: string
  hinhThuc: HinhThuc
  kyThuatId: string
  ngayNhan: string
  ngayHenTra?: string
  moTaLoi: string
  loiSuaChua?: string[]
  chiPhiDuKien: number
  ghiChu?: string
}

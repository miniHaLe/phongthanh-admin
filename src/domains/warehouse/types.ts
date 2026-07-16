/**
 * Warehouse + stock-out domain types — the reference entity shapes for the
 * warehouse (quan-ly-kho) and stock-out (xuat-kho) lists, inventory views, and
 * the 6 line-item editors. Field names follow the verified reference columns.
 */
import type { RepairStatusId } from '@/domains/repair/status'

// ── Inventory (Xem Tồn Kho family) ─────────────────────────────────────────

export interface InventoryRow {
  id: string
  branchId: string
  maHang: string
  tenHang: string
  nhomHang: string
  model: string
  nhaSanXuat: string
  khoId: string
  khoTen: string
  nganChuaId: string
  nganChua: string
  kyId: string
  kyLabel: string
  coSerial: boolean
  giaVonDauKy: number
  tonDauKy: number
  nhapTrongKy: number
  xuatTrongKy: number
  ton: number
  giaVonTrongKy: number
  tonCuoiKy: number
  tongTien: number
  /** Technician axis — only populated for the Kỹ thuật inventory view. */
  kyThuat?: string
}

export interface InventoryKpiTrio {
  tonDauKy: number
  tongTien: number
  tongTon: number
}

export interface InventoryResult {
  rows: InventoryRow[]
  total: number
  kpi: InventoryKpiTrio
}

export type InventoryKind = 'ton-kho' | 'ton-kho-lk-xac' | 'ton-kho-ky-thuat'

// ── Nhập Kho (goods receipt) ───────────────────────────────────────────────

export interface ReceivingLine {
  ma: string
  ten: string
  nganChuaId: string
  nganChua: string
  soLuong: number
  donGia: number
  thanhTien: number
  capNhatGia: boolean
  serial: string
}

export interface ReceivingVoucher {
  id: string
  soPhieu: string
  soDatHang: string
  soHoaDon: string
  nhaCungCap: string
  nhaCungCapSdt: string
  hinhThucThanhToan: string
  khoId: string
  khoTen: string
  soTien: number
  nguoiLap: string
  ngayLap: string // ISO
  ghiChu: string
  branchId: string
  lines: ReceivingLine[]
}

// ── Cấp Linh Kiện (parts issue to technician) ──────────────────────────────

export const CAP_LINH_KIEN_MUC_DICH_OPTIONS = [
  'Sữa chữa dịch vụ',
  'Bảo hành',
  'Kỹ thuật mượn',
] as const

export interface CheckOutLine {
  serial: string
  soPhieuSC: string
  maHang: string
  tenHang: string
  nhaSanXuat: string
  model: string
  khoId: string
  khoTen: string
  nganChuaId: string
  nganChua: string
  mucDich: string
  gia: number
  soLuong: number
  thanhTien: number
}

export interface CheckOutSlip {
  id: string
  soPhieuCap: string
  ngayLap: string
  kyThuat: string
  soTien: number
  nguoiLap: string
  ghiChu: string
  branchId: string
  lines: CheckOutLine[]
}

// ── Bán Hàng (sales order) ─────────────────────────────────────────────────

export interface SellingLine {
  hangHoaId: string
  maHang: string
  tenHang: string
  model: string
  serial: string
  khoId: string
  khoTen: string
  capNhatGia: boolean
  giaVon: number
  giaBan: number
  soLuong: number
  thanhTien: number
}

export interface SellingOrder {
  id: string
  soPhieu: string
  ngayLap: string
  khachHang: string
  dienThoai: string
  hinhThucThanhToan: string
  tongTien: number
  nguoiLap: string
  ghiChu: string
  branchId: string
  lines: SellingLine[]
}

// ── Trả Hàng (return slip) ─────────────────────────────────────────────────

export interface ReturnSlip {
  id: string
  soPhieu: string
  ngayTra: string
  hinhThucTra: string
  nguoiLap: string
  branchId: string
}

// ── Chuyển Kho (stock transfer) ────────────────────────────────────────────

export type ChuyenKhoTrangThai = 'Chưa xác nhận' | 'Đã xác nhận' | 'Không xác nhận'

export interface MovingSlip {
  id: string
  trangThai: ChuyenKhoTrangThai
  soPhieu: string
  ngayLap: string
  tuChiNhanh: string
  tuKho: string
  denChiNhanh: string
  denKho: string
  loai: string
  nguoiChuyen: string
  branchId: string
}

// ── DSCapLK — issued-part usage (Danh sách sử dụng linh kiện) ───────────────

export type IssuedPartTinhTrang =
  | 'Đã trả xác LK'
  | 'Chưa trả xác LK'
  | 'Có trả LK'
  | 'Chưa trả LK'

export interface IssuedPartUsage {
  id: string
  tinhTrang: IssuedPartTinhTrang
  soPhieuCap: string
  soPhieuSC: string
  soPhieuHang: string
  /** Ticket status id → the color-coded badge next to Số phiếu hãng. */
  ticketStatusId: RepairStatusId
  model: string
  serial: string
  nsx: string
  nhaKho: string
  maHang: string
  tenHang: string
  kyThuat: string
  mucDich: string
  ngayCap: string
  nguoiCap: string
  ngayGiao: string
  ngayTX: string
  nguoiTX: string
  soLuongCap: number
  slTra: number
  branchId: string
}

// ── DSTraLK — parts return (Danh sách trả linh kiện) ────────────────────────

export type PartReturnTinhTrang = 'Chờ duyệt' | 'Đã duyệt'

export interface PartReturn {
  id: string
  tinhTrang: PartReturnTinhTrang
  hinhThuc: string // Loại trả: Trả từ phiếu | Trả từ kỹ thuật
  maHang: string
  tenHang: string
  kyThuat: string
  sl: number
  soPhieuCap: string
  soPhieuSC: string
  soPhieuHang: string
  model: string
  serial: string
  nsx: string
  ngayTao: string
  nguoiTao: string
  ngayDuyet: string
  nguoiDuyet: string
  branchId: string
}

// ── DSTraLKXac — carcass parts return (Danh sách trả linh kiện xác) ─────────

export type PartReturnXacTinhTrang = 'Chưa trả hãng' | 'Đã trả hãng'

export interface PartReturnXac {
  id: string
  tinhTrang: PartReturnXacTinhTrang
  maVanDon: string
  soPhieuCap: string
  soPhieuSC: string
  soPhieuHang: string
  model: string
  serial: string
  nhaKho: string
  nsx: string
  maHang: string
  tenHang: string
  kyThuat: string
  mucDich: string
  ngayTX: string
  nguoiTX: string
  sl: number
  ngayTao: string
  nguoiTao: string
  branchId: string
}

export interface WarehouseListResult<T> {
  data: T[]
  total: number
}

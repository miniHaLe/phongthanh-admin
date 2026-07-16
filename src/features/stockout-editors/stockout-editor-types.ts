/**
 * Local line-item + editor-input types for the 5 stock-out full-page editors.
 * Kept in `stockout-editors` (not `@/domains/warehouse/types`, which this
 * phase only imports) since the 6 voucher/slip list entities there don't
 * carry line-level detail.
 */

// ── Cấp Linh Kiện (parts issue to technician) ──────────────────────────────

export interface CapLinhKienLine {
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

// ── Bán Hàng (sales order line) ────────────────────────────────────────────

export type { SellingLine as BanHangLine } from '@/domains/warehouse/types'

// ── Trả Hàng (return line) ─────────────────────────────────────────────────

export const HINH_THUC_TRA_EDITOR_OPTIONS = [
  'Trả hàng từ kỹ thuật',
  'Trả hàng từ khách hàng',
  'Trả hàng cho nhà cung cấp',
  'Trả xác linh kiện',
] as const

export interface TraHangLine {
  maPhieu: string
  soPhieuSC: string
  serial: string
  tenHang: string
  kho: string
  nganChua: string
  gia: number
  soLuong: number
  soLuongTra: number
  thanhTien: number
}

// ── Chuyển Kho (stock transfer line) ───────────────────────────────────────

export interface ChuyenKhoCrossLine {
  serial: string
  ma: string
  ten: string
  soLuong: number
  soLuongChuyen: number
  gia: number
  thanhTien: number
}

export interface ChuyenKhoSameLine {
  serial: string
  ma: string
  ten: string
  nganChua: string
  soLuong: number
  gia: number
  thanhTien: number
}

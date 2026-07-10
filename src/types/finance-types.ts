/**
 * Finance domain types — reference-parity rebuild (Tài Chính).
 * ThuChi = Chứng từ (thu/chi voucher, 12-type taxonomy + collection state).
 * CongNo = per-ticket receivables (Phiếu sửa chữa / Phiếu bán hàng), no
 * due-date/overdue concept. HoaDon = VAT invoice with editable-rate VAT +
 * line items.
 */

// ─── ThuChi (Chứng từ) ────────────────────────────────────────────────────

export interface ThuChi {
  id: string
  /** PTT-yyyymmdd-N (thu) | PCC-yyyymmdd-N (chi). */
  soChungTu: string
  /** LOAI_THU_CHI id — 12-value taxonomy (@/mock/seed/chung-tu). */
  loaiThuChi: number
  /** TINH_TRANG_CHUNG_TU id — collection state, NOT an approval state. */
  tinhTrang: number
  /** HINH_THUC_THU_CHI id (Tiền mặt/Công nợ/Chuyển khoản). */
  hinhThucId: number
  /**
   * Source document code — a repair ticket's `soPhieu` for repair-thu rows
   * (resolvable via MOCK_TICKETS, opens /Repairing/Detail in a new tab),
   * null otherwise.
   */
  soPhieuScNk: string | null
  kyThuatId: string | null
  kyThuat: string | null
  /** Đại lý/Trạm — only populated for repair-sourced rows with a dealer. */
  daiLy: string | null
  tenKhachHang: string
  ngayLap: string // ISO
  soTien: number
  noiDung: string
  nguoiTaoId: string
  nguoiTao: string
  /** Settled only (tinhTrang 2/4/5) — else both null. */
  nguoiThuChiId: string | null
  nguoiThuChi: string | null
  ngayThuChi: string | null
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

// ─── CongNo (per-ticket receivables) ──────────────────────────────────────

export type LoaiPhieuCongNo = 'Phiếu sửa chữa' | 'Phiếu bán hàng'

export interface CongNo {
  id: string
  soPhieu: string
  loaiPhieu: LoaiPhieuCongNo
  ngayLap: string // ISO
  kyThuatId: string | null
  kyThuat: string | null
  soTien: number
  daTra: number
  /** Invariant: conLai = soTien - daTra (always > 0 while listed as công nợ). */
  conLai: number
  customerId: string
  tenKhachHang: string
  dienThoai: string
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

// ─── HoaDon (VAT invoice) ─────────────────────────────────────────────────

export interface HoaDonItem {
  maHang: string
  tenHang: string
  donViTinh: string
  soLuong: number
  donGia: number
  thanhTien: number
}

/** HinhThucThanhToan ids shared with @/mock/seed/chung-tu HINH_THUC_THU_CHI. */
export type HinhThucThanhToanId = 1 | 2 | 3 // Tiền mặt / Công nợ / Chuyển khoản

export interface HoaDon {
  id: string
  soHoaDon: string
  ngayXuat: string // ISO
  tenKhachHangMua: string
  hinhThucId: HinhThucThanhToanId
  maSoThue: string
  tenDonVi: string
  diaChi: string
  customerId: string | null
  /** Editable VAT rate (percent), default 10. */
  vatRate: number
  /** Subtotal — sum of line thanhTien. */
  tongThanhTien: number
  /** tongThanhTien * vatRate / 100. */
  tienThue: number
  /** tongThanhTien + tienThue. */
  tongThanhToan: number
  items: HoaDonItem[]
  nguoiLapId: string
  nguoiLap: string
  ghiChu: string
  branchId: string
  createdAt: string
  updatedAt?: string
  active: boolean
}

// ─── Finance KPI (legacy period-scoped strip — kept for the unowned
// FinanceKpiStrip/use-finance-kpi consumers; ThuChiPage computes its own
// search-scoped KPI boxes independently, see thu-chi-kpi-boxes.tsx). ───────

export interface FinanceKpi {
  period: { from: string; to: string }
  tong_thu: number
  tong_chi: number
  cong_no_phai_thu: number
  cong_no_phai_tra: number
}

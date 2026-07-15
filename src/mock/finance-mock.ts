/**
 * Finance mock data — Chứng từ (Thu Chi), Công nợ (per-ticket receivables),
 * Hóa đơn (VAT invoice). Wires the P1 lookup modules (`chung-tu`, `cong-no`)
 * into this live layer that ThuChiPage/CongNoPage/HoaDonPage read.
 *
 * Deterministic — every row derives from SeededRandom or a P1 lookup array.
 * No `new Date()` / `Date.now()` drives any stored field or displayed state
 * (mutation timestamps below use `new Date().toISOString()` only for the
 * "when was this mock write applied" audit field, same pattern every other
 * mock mutation in this app uses — never compared against for status).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow } from '@/lib/mock-error'
import { nextVoucherCode } from '@/lib/voucher-code'
import { makeMockApi } from '@/mock/masterdata'
import { KHACH_HANG_ROWS } from '@/mock/masterdata'
import { BRANCHES } from '@/mock/seed/branches'
import { CHUNG_TU } from '@/mock/seed/chung-tu'
import { CONG_NO } from '@/mock/seed/cong-no'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { CURRENT_USER } from '@/mock/current-user-mock'
import type { ThuChi, CongNo, HoaDon, HoaDonItem, FinanceKpi } from '@/types/finance-types'

const TICKET_BY_SO_PHIEU = new Map(MOCK_TICKETS.map((t) => [t.soPhieu, t]))

// ─── Thu Chi (Chứng từ) ───────────────────────────────────────────────────

// Display names for the synthetic creator/settler ids baked into the P1
// ChungTu seed (@/mock/seed/chung-tu — stable, fixed id lists there).
const NGUOI_TAO_NAME: Record<string, string> = {
  'nv-thu-ngan-1': 'Nguyễn Thị Thu Ngân',
  'nv-thu-ngan-2': 'Trần Văn Ngân',
  'nv-ke-toan-1': 'Lê Thị Kế Toán',
}
const NGUOI_THU_CHI_NAME: Record<string, string> = {
  'nv-thu-quy-1': 'Phạm Văn Thu Quỹ',
  'nv-thu-quy-2': 'Hoàng Thị Quỹ',
}

const rngTC = new SeededRandom(5001)

export const THU_CHI_ROWS: ThuChi[] = CHUNG_TU.map((c) => {
  const ticket = c.soPhieuScNk ? (TICKET_BY_SO_PHIEU.get(c.soPhieuScNk) ?? null) : null
  const branch = ticket
    ? (BRANCHES.find((b) => b.id === ticket.branchId) ?? rngTC.pick(BRANCHES))
    : rngTC.pick(BRANCHES)

  return {
    id: c.id,
    soChungTu: c.soChungTu,
    loaiThuChi: c.loaiThuChi,
    tinhTrang: c.tinhTrang,
    hinhThucId: c.hinhThucId,
    soPhieuScNk: c.soPhieuScNk,
    kyThuatId: c.kyThuatId,
    kyThuat: ticket ? ticket.kyThuat : null,
    daiLy: ticket ? (ticket.khachHang.daiLy ?? null) : null,
    // The P1 seed's tenKhachHang carries a real customer name only on
    // ticket-linked rows; non-ticket rows there hold a content string, not a
    // name (see @/mock/seed/chung-tu buildChungTu). Substitute a synthetic
    // customer name here so every row renders a real "Tên khách hàng" value.
    tenKhachHang: ticket ? c.tenKhachHang : rngTC.pick(KHACH_HANG_ROWS).tenKH,
    ngayLap: c.ngayLap,
    soTien: c.soTien,
    noiDung: c.noiDung,
    nguoiTaoId: c.nguoiTaoId,
    nguoiTao: NGUOI_TAO_NAME[c.nguoiTaoId] ?? c.nguoiTaoId,
    nguoiThuChiId: c.nguoiThuChiId,
    nguoiThuChi: c.nguoiThuChiId ? (NGUOI_THU_CHI_NAME[c.nguoiThuChiId] ?? c.nguoiThuChiId) : null,
    ngayThuChi: c.ngayThuChi,
    branchId: branch.id,
    createdAt: c.ngayLap,
    active: true,
  }
})

export const thuChiApi = makeMockApi<ThuChi>(THU_CHI_ROWS)

// ─── Công nợ (per-ticket receivables) ─────────────────────────────────────

const rngCN = new SeededRandom(5002)

export const CONG_NO_ROWS: CongNo[] = CONG_NO.map((r) => {
  const ticket = TICKET_BY_SO_PHIEU.get(r.soPhieu) ?? null
  const branch = ticket
    ? (BRANCHES.find((b) => b.id === ticket.branchId) ?? rngCN.pick(BRANCHES))
    : rngCN.pick(BRANCHES)

  return {
    id: r.id,
    soPhieu: r.soPhieu,
    loaiPhieu: r.loaiPhieu,
    ngayLap: r.ngayLap,
    kyThuatId: r.kyThuatId,
    kyThuat: r.kyThuat,
    soTien: r.soTien,
    daTra: r.daTra,
    conLai: r.conLai,
    customerId: r.customerId,
    tenKhachHang: ticket ? ticket.khachHang.ten : rngCN.pick(KHACH_HANG_ROWS).tenKH,
    dienThoai: r.dienThoai,
    branchId: branch.id,
    createdAt: r.ngayLap,
    active: true,
  }
})

export const congNoApi = makeMockApi<CongNo>(CONG_NO_ROWS)

let chungTuSettleSeq = THU_CHI_ROWS.length

export interface ThanhToanCongNoInput {
  congNoId: string
  soTien: number
  hinhThucId: number
  ghiChu?: string
}

/**
 * Settle (fully or partially) a Công nợ row: reduces Còn lại and appends a
 * matching Phiếu Thu (thu voucher) to THU_CHI_ROWS so ThuChi reflects the
 * payment. Both stores are mutated in the same call so the two lists stay
 * consistent within a session (module-memory only, per app-wide mock convention).
 */
export async function thanhToanCongNo(input: ThanhToanCongNoInput): Promise<ThuChi> {
  await mockDelay(300, 150)
  maybeThrow(0.03)

  const row = CONG_NO_ROWS.find((r) => r.id === input.congNoId)
  if (!row) throw new Error(`Không tìm thấy công nợ id=${input.congNoId}`)
  if (input.soTien <= 0) throw new Error('Số tiền thanh toán phải lớn hơn 0')

  const amount = Math.min(input.soTien, row.conLai)
  row.daTra += amount
  row.conLai -= amount

  chungTuSettleSeq += 1
  const nowDate = new Date()
  const now = nowDate.toISOString()
  // Phiếu Thu Sửa Chữa(3) for repair receivables, Phiếu Thu Bán Hàng(5) for sales.
  const loaiThuChi = row.loaiPhieu === 'Phiếu sửa chữa' ? 3 : 5

  const voucher: ThuChi = {
    id: `tc-settle-${chungTuSettleSeq}`,
    soChungTu: nextVoucherCode(
      'PTT',
      THU_CHI_ROWS.map((item) => item.soChungTu),
      nowDate,
    ),
    loaiThuChi,
    tinhTrang: 2, // Đã thu
    hinhThucId: input.hinhThucId,
    soPhieuScNk: row.soPhieu,
    kyThuatId: row.kyThuatId,
    kyThuat: row.kyThuat,
    daiLy: null,
    tenKhachHang: row.tenKhachHang,
    ngayLap: now,
    soTien: amount,
    noiDung: input.ghiChu?.trim() || `Thanh toán công nợ ${row.soPhieu}`,
    nguoiTaoId: 'current-user',
    nguoiTao: CURRENT_USER.hoVaTen,
    nguoiThuChiId: 'current-user',
    nguoiThuChi: CURRENT_USER.hoVaTen,
    ngayThuChi: now,
    branchId: row.branchId,
    createdAt: now,
    active: true,
  }
  THU_CHI_ROWS.unshift(voucher)
  return voucher
}

export interface LapPhieuInput {
  loaiThuChi: number
  hinhThucId: number
  tenKhachHang: string
  soTien: number
  noiDung: string
  branchId: string
}

/** Create a manual Phiếu Thu (header "Lập Phiếu Thu") — always posted (Đã thu). */
export async function createPhieuThu(input: LapPhieuInput): Promise<ThuChi> {
  await mockDelay(300, 150)
  maybeThrow(0.03)
  chungTuSettleSeq += 1
  const nowDate = new Date()
  const now = nowDate.toISOString()
  const voucher: ThuChi = {
    id: `tc-thu-${chungTuSettleSeq}`,
    soChungTu: nextVoucherCode(
      'PTT',
      THU_CHI_ROWS.map((item) => item.soChungTu),
      nowDate,
    ),
    loaiThuChi: input.loaiThuChi,
    tinhTrang: 2,
    hinhThucId: input.hinhThucId,
    soPhieuScNk: null,
    kyThuatId: null,
    kyThuat: null,
    daiLy: null,
    tenKhachHang: input.tenKhachHang,
    ngayLap: now,
    soTien: input.soTien,
    noiDung: input.noiDung,
    nguoiTaoId: 'current-user',
    nguoiTao: CURRENT_USER.hoVaTen,
    nguoiThuChiId: 'current-user',
    nguoiThuChi: CURRENT_USER.hoVaTen,
    ngayThuChi: now,
    branchId: input.branchId,
    createdAt: now,
    active: true,
  }
  THU_CHI_ROWS.unshift(voucher)
  return voucher
}

/** Create a manual Phiếu Chi (header "Lập Phiếu Chi") — always posted (Đã chi). */
export async function createPhieuChi(input: LapPhieuInput): Promise<ThuChi> {
  await mockDelay(300, 150)
  maybeThrow(0.03)
  chungTuSettleSeq += 1
  const nowDate = new Date()
  const now = nowDate.toISOString()
  const voucher: ThuChi = {
    id: `tc-chi-${chungTuSettleSeq}`,
    soChungTu: nextVoucherCode(
      'PCC',
      THU_CHI_ROWS.map((item) => item.soChungTu),
      nowDate,
    ),
    loaiThuChi: input.loaiThuChi,
    tinhTrang: 4,
    hinhThucId: input.hinhThucId,
    soPhieuScNk: null,
    kyThuatId: null,
    kyThuat: null,
    daiLy: null,
    tenKhachHang: input.tenKhachHang,
    ngayLap: now,
    soTien: input.soTien,
    noiDung: input.noiDung,
    nguoiTaoId: 'current-user',
    nguoiTao: CURRENT_USER.hoVaTen,
    nguoiThuChiId: 'current-user',
    nguoiThuChi: CURRENT_USER.hoVaTen,
    ngayThuChi: now,
    branchId: input.branchId,
    createdAt: now,
    active: true,
  }
  THU_CHI_ROWS.unshift(voucher)
  return voucher
}

// ─── Hóa đơn (VAT invoice) ─────────────────────────────────────────────────

const rngHD = new SeededRandom(5003)

const HANG_HOA_LIST = [
  { ma: 'HH00001', ten: 'Pin iPhone 15', dvt: 'Cái', gia: 450000 },
  { ma: 'HH00002', ten: 'Pin iPhone 14', dvt: 'Cái', gia: 380000 },
  { ma: 'HH00003', ten: 'Màn hình iPhone 15', dvt: 'Cái', gia: 1800000 },
  { ma: 'HH00004', ten: 'Màn hình Samsung S24', dvt: 'Cái', gia: 1500000 },
  { ma: 'HH00005', ten: 'Camera sau iPhone 15', dvt: 'Cái', gia: 2200000 },
  { ma: 'HH00006', ten: 'Cáp sạc Lightning', dvt: 'Cái', gia: 120000 },
  { ma: 'HH00007', ten: 'Sạc nhanh 65W', dvt: 'Cái', gia: 350000 },
  { ma: 'HH00008', ten: 'Kính cường lực 9H', dvt: 'Cái', gia: 80000 },
  { ma: 'HH00009', ten: 'Ốp lưng silicon', dvt: 'Cái', gia: 65000 },
  { ma: 'HH00010', ten: 'Vỏ iPhone 14 Pro', dvt: 'Bộ', gia: 980000 },
]

const NGUOI_LAP_LIST = ['Nguyễn Thị Thu Ngân', 'Trần Văn Ngân', 'Lê Thị Kế Toán']

// Existing invoices only carry Tiền mặt(1) / Chuyển khoản(3) — Công nợ(2) is
// create-only on the composer per the verified reference (not a list value).
const HINH_THUC_LIST_FOR_ROWS = [1, 3] as const

function genHoaDonItems(seed: SeededRandom): HoaDonItem[] {
  const count = seed.int(1, 4)
  const items: HoaDonItem[] = []
  for (let j = 0; j < count; j++) {
    const hh = seed.pick(HANG_HOA_LIST)
    const sl = seed.int(1, 3)
    items.push({
      maHang: hh.ma,
      tenHang: hh.ten,
      donViTinh: hh.dvt,
      soLuong: sl,
      donGia: hh.gia,
      thanhTien: sl * hh.gia,
    })
  }
  return items
}

export const HOA_DON_ROWS: HoaDon[] = Array.from({ length: 55 }, (_, i) => {
  const kh = rngHD.pick(KHACH_HANG_ROWS)
  const branch = rngHD.pick(BRANCHES)
  const ngay = rngHD.isoDateWithin(180)
  const items = genHoaDonItems(rngHD)
  const tongThanhTien = items.reduce((s, it) => s + it.thanhTien, 0)
  const vatRate = 10
  const tienThue = Math.round((tongThanhTien * vatRate) / 100)
  const seq = i + 1

  return {
    id: `hd-${seq}`,
    soHoaDon: `HD-${String(seq).padStart(5, '0')}`,
    ngayXuat: ngay,
    tenKhachHangMua: kh.tenKH,
    hinhThucId: rngHD.pick(HINH_THUC_LIST_FOR_ROWS),
    maSoThue: `${rngHD.int(1000000000, 9999999999)}`,
    tenDonVi: kh.tenKH,
    diaChi: kh.diaChi ?? '',
    customerId: kh.id,
    vatRate,
    tongThanhTien,
    tienThue,
    tongThanhToan: tongThanhTien + tienThue,
    items,
    nguoiLapId: `nv-lap-hd-${(i % NGUOI_LAP_LIST.length) + 1}`,
    nguoiLap: rngHD.pick(NGUOI_LAP_LIST),
    ghiChu: '',
    branchId: branch.id,
    createdAt: ngay,
    updatedAt: rngHD.bool(0.2) ? rngHD.isoDateWithin(30) : undefined,
    active: true,
  }
})

export const hoaDonApi = makeMockApi<HoaDon>(HOA_DON_ROWS)

export interface CreateHoaDonInput {
  soHoaDon: string
  ngayXuat: string
  tenKhachHangMua: string
  hinhThucId: number
  maSoThue: string
  tenDonVi: string
  diaChi: string
  customerId: string | null
  vatRate: number
  items: HoaDonItem[]
  ghiChu: string
  branchId: string
}

/** Create-mutation for the invoice composer (F3b Lưu / Lưu & Thêm mới). */
export async function createHoaDon(input: CreateHoaDonInput): Promise<HoaDon> {
  await mockDelay(300, 150)
  maybeThrow(0.03)

  const tongThanhTien = input.items.reduce((s, it) => s + it.thanhTien, 0)
  const tienThue = Math.round((tongThanhTien * input.vatRate) / 100)
  const now = new Date().toISOString()

  const invoice: HoaDon = {
    id: `hd-new-${HOA_DON_ROWS.length + 1}`,
    soHoaDon: input.soHoaDon,
    ngayXuat: input.ngayXuat,
    tenKhachHangMua: input.tenKhachHangMua,
    hinhThucId: input.hinhThucId as HoaDon['hinhThucId'],
    maSoThue: input.maSoThue,
    tenDonVi: input.tenDonVi,
    diaChi: input.diaChi,
    customerId: input.customerId,
    vatRate: input.vatRate,
    tongThanhTien,
    tienThue,
    tongThanhToan: tongThanhTien + tienThue,
    items: input.items,
    nguoiLapId: 'current-user',
    nguoiLap: CURRENT_USER.hoVaTen,
    ghiChu: input.ghiChu,
    branchId: input.branchId,
    createdAt: now,
    active: true,
  }
  HOA_DON_ROWS.unshift(invoice)
  return invoice
}

// ─── Finance KPI (legacy period-scoped strip) ─────────────────────────────
// Retained so `use-finance-kpi.ts` / `finance-kpi-mock.ts` (not owned by this
// phase) keep compiling against this module's exports. ThuChiPage computes
// its own search-scoped KPI boxes directly from filtered rows (see
// thu-chi.config.ts) rather than calling this — Công nợ has no KPI strip.

export interface FinanceKpiParams {
  from: string
  to: string
  branchId?: string | null
}

export async function fetchFinanceKpi(params: FinanceKpiParams): Promise<FinanceKpi> {
  await mockDelay(400, 200)
  maybeThrow(0.03)

  const { from, to, branchId } = params
  const fromMs = new Date(from).getTime()
  const toMs = new Date(to).getTime() + 86_400_000 // inclusive

  const tcFiltered = THU_CHI_ROWS.filter((r) => {
    const d = new Date(r.ngayLap).getTime()
    const inPeriod = d >= fromMs && d <= toMs
    const inBranch = !branchId || r.branchId === branchId
    return inPeriod && inBranch
  })

  const tong_thu = tcFiltered
    .filter((r) => r.tinhTrang === 2 || r.tinhTrang === 5)
    .reduce((s, r) => s + r.soTien, 0)
  const tong_chi = tcFiltered
    .filter((r) => r.tinhTrang === 4)
    .reduce((s, r) => s + r.soTien, 0)

  const cnFiltered = CONG_NO_ROWS.filter((r) => !branchId || r.branchId === branchId)
  const cong_no_phai_thu = cnFiltered.reduce((s, r) => s + r.conLai, 0)

  return {
    period: { from, to },
    tong_thu,
    tong_chi,
    cong_no_phai_thu,
    // Công nợ is per-ticket customer receivables only (no due-date/payable
    // side in the reference) — there is no "phải trả" concept to sum here.
    cong_no_phai_tra: 0,
  }
}

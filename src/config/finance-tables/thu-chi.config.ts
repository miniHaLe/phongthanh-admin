/**
 * Thu Chi (Chứng từ) — shared constants for the hand-composed ThuChiPage
 * (a page-level DataTable like repair-list, not CrudTablePage, per the KPI +
 * dual-create-button + print-only-row-action requirements). This module owns
 * the column label list + filter option lists so both the page and its tests
 * import one source of truth.
 */
import {
  LOAI_THU_CHI,
  TINH_TRANG_CHUNG_TU,
  HINH_THUC_THU_CHI,
  THU_TYPE_IDS,
  CHI_TYPE_IDS,
} from '@/mock/seed/chung-tu'
import { BRANCHES } from '@/mock/seed/branches'

export const THU_CHI_TABLE_ID = 'thu-chi'

/** The 15 verified data-column headers, in order (excludes the leading checkbox). */
export const THU_CHI_COLUMN_LABELS: string[] = [
  'Tình Trạng',
  'Số chứng từ',
  'Loại phiếu',
  'Hình thức',
  'Số Phiếu SC/NK',
  'Kỹ thuật',
  'Đại lý/Trạm',
  'Tên khách hàng',
  'Ngày lập',
  'Số tiền',
  'Nội dung',
  'Người tạo',
  'Người Thu/Chi',
  'Ngày Thu/Chi',
  'Chọn',
]

export const LOAI_THU_CHI_FILTER_OPTIONS = LOAI_THU_CHI.map((l) => ({
  label: l.ten,
  value: String(l.id),
}))

/**
 * Display order requested by the spec — differs from TINH_TRANG_CHUNG_TU's
 * storage order (which groups thu-states 1,2 before chi-states 3,4, with
 * `Đã thu ngoài` trailing at id 5).
 */
const TINH_TRANG_DISPLAY_ORDER = [
  'Chưa thu',
  'Đã thu',
  'Đã thu ngoài',
  'Chưa chi',
  'Đã chi',
]
export const TINH_TRANG_FILTER_OPTIONS = TINH_TRANG_DISPLAY_ORDER.map((ten) => {
  const found = TINH_TRANG_CHUNG_TU.find((t) => t.ten === ten)!
  return { label: found.ten, value: String(found.id) }
})

export const HINH_THUC_FILTER_OPTIONS = HINH_THUC_THU_CHI.map((h) => ({
  label: h.ten,
  value: String(h.id),
}))

export const BRANCH_FILTER_OPTIONS = BRANCHES.map((b) => ({
  label: b.name,
  value: b.id,
}))

export const LOAI_NGAY_OPTIONS = [
  { label: 'Ngày lập', value: 'ngay_lap' as const },
  { label: 'Ngày thu/chi', value: 'ngay_thu_chi' as const },
]
export type LoaiNgay = (typeof LOAI_NGAY_OPTIONS)[number]['value']

const THU_SET = new Set<number>(THU_TYPE_IDS)
const CHI_SET = new Set<number>(CHI_TYPE_IDS)

export function isThuType(loaiThuChi: number): boolean {
  return THU_SET.has(loaiThuChi)
}
export function isChiType(loaiThuChi: number): boolean {
  return CHI_SET.has(loaiThuChi)
}

export function loaiThuChiLabel(id: number): string {
  return LOAI_THU_CHI.find((l) => l.id === id)?.ten ?? String(id)
}
export function tinhTrangLabel(id: number): string {
  return TINH_TRANG_CHUNG_TU.find((t) => t.id === id)?.ten ?? String(id)
}
export function hinhThucLabel(id: number): string {
  return HINH_THUC_THU_CHI.find((h) => h.id === id)?.ten ?? String(id)
}

/** Loại thu chi options restricted to the thu subset (Lập Phiếu Thu form). */
export const LOAI_THU_OPTIONS = LOAI_THU_CHI.filter((l) => isThuType(l.id)).map(
  (l) => ({ label: l.ten, value: String(l.id) }),
)
/** Loại thu chi options restricted to the chi subset (Lập Phiếu Chi form). */
export const LOAI_CHI_OPTIONS = LOAI_THU_CHI.filter((l) => isChiType(l.id)).map(
  (l) => ({ label: l.ten, value: String(l.id) }),
)

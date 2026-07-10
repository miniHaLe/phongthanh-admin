/**
 * Công Nợ (per-ticket receivables) — shared constants for the hand-composed
 * CongNoPage. NO checkbox column (verified); no due-date/overdue concept.
 */
import { BRANCHES } from '@/mock/seed/branches'
import type { LoaiPhieuCongNo } from '@/types/finance-types'

export const CONG_NO_TABLE_ID = 'cong-no'

/** The 10 verified column headers, in order. */
export const CONG_NO_COLUMN_LABELS: string[] = [
  'Số phiếu',
  'Loại phiếu',
  'Ngày lập',
  'KTV',
  'Số tiền',
  'Đã trả',
  'Còn lại',
  'Tên khách hàng',
  'Điện thoại',
  'Chọn',
]

export const LOAI_THANH_TOAN_OPTIONS: { label: string; value: LoaiPhieuCongNo }[] = [
  { label: 'Phiếu sửa chữa', value: 'Phiếu sửa chữa' },
  { label: 'Phiếu bán hàng', value: 'Phiếu bán hàng' },
]

export const BRANCH_FILTER_OPTIONS = BRANCHES.map((b) => ({
  label: b.name,
  value: b.id,
}))

export const NGAY_TOGGLE_OPTIONS = [
  { label: 'Tất cả', value: 'tat_ca' as const },
  { label: 'Theo ngày', value: 'theo_ngay' as const },
]
export type NgayToggle = (typeof NGAY_TOGGLE_OPTIONS)[number]['value']

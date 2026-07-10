/**
 * Mock create-mutation for the two Chuyển Kho editors (same-branch,
 * cross-branch). Appends a new slip to the already-exported, mutable
 * `MOVING_ROWS` store (owned by `src/domains/warehouse/list-data.ts`,
 * imported here — not modified) so the list page's fetcher immediately
 * reflects it on invalidate. Module-memory only; lost on reload like every
 * other mock mutation in this app.
 */
import { MOVING_ROWS } from '@/domains/warehouse/list-data'
import type { MovingSlip } from '@/domains/warehouse/types'

let movingSeq = MOVING_ROWS.length

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export interface CreateMovingInput {
  tuChiNhanh: string
  tuKho: string
  denChiNhanh: string
  denKho: string
  loai: 'Cùng chi nhánh' | 'Khác chi nhánh'
  nguoiChuyen: string
  branchId: string
}

export function createMoving(input: CreateMovingInput): MovingSlip {
  movingSeq += 1
  const now = new Date().toISOString()
  const slip: MovingSlip = {
    id: `ck-new-${movingSeq}`,
    trangThai: 'Chưa xác nhận',
    soPhieu: `PCK-${ymd(now)}-${movingSeq}`,
    ngayLap: now,
    tuChiNhanh: input.tuChiNhanh,
    tuKho: input.tuKho,
    denChiNhanh: input.denChiNhanh,
    denKho: input.denKho,
    loai: input.loai,
    nguoiChuyen: input.nguoiChuyen,
    branchId: input.branchId,
  }
  MOVING_ROWS.unshift(slip)
  return slip
}

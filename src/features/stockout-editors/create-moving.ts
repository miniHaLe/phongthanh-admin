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
import { nextVoucherCode } from '@/lib/voucher-code'

let movingIdSeq = MOVING_ROWS.length

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
  movingIdSeq += 1
  const now = new Date()
  const slip: MovingSlip = {
    id: `ck-new-${movingIdSeq}`,
    trangThai: 'Chưa xác nhận',
    soPhieu: nextVoucherCode(
      'PCK',
      MOVING_ROWS.map((row) => row.soPhieu),
      now,
    ),
    ngayLap: now.toISOString(),
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

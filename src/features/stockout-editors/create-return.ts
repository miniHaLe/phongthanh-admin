/**
 * Mock create-mutation for the Trả Hàng editor. Appends a new slip to the
 * already-exported, mutable `RETURN_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { RETURN_ROWS } from '@/domains/warehouse/list-data'
import type { ReturnSlip } from '@/domains/warehouse/types'
import { nextVoucherCode } from '@/lib/voucher-code'

let returnIdSeq = RETURN_ROWS.length

export interface CreateReturnInput {
  hinhThucTra: string
  nguoiLap: string
  branchId: string
}

export function createReturn(input: CreateReturnInput): ReturnSlip {
  returnIdSeq += 1
  const now = new Date()
  const slip: ReturnSlip = {
    id: `th-new-${returnIdSeq}`,
    soPhieu: nextVoucherCode(
      'PTH',
      RETURN_ROWS.map((row) => row.soPhieu),
      now,
    ),
    ngayTra: now.toISOString(),
    hinhThucTra: input.hinhThucTra,
    nguoiLap: input.nguoiLap,
    branchId: input.branchId,
  }
  RETURN_ROWS.unshift(slip)
  return slip
}

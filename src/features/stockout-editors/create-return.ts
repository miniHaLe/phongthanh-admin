/**
 * Mock create-mutation for the Trả Hàng editor. Appends a new slip to the
 * already-exported, mutable `RETURN_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { RETURN_ROWS } from '@/domains/warehouse/list-data'
import type { ReturnSlip } from '@/domains/warehouse/types'

let returnSeq = RETURN_ROWS.length

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export interface CreateReturnInput {
  hinhThucTra: string
  nguoiLap: string
  branchId: string
}

export function createReturn(input: CreateReturnInput): ReturnSlip {
  returnSeq += 1
  const now = new Date().toISOString()
  const slip: ReturnSlip = {
    id: `th-new-${returnSeq}`,
    soPhieu: `PTH-${ymd(now)}-${returnSeq}`,
    ngayTra: now,
    hinhThucTra: input.hinhThucTra,
    nguoiLap: input.nguoiLap,
    branchId: input.branchId,
  }
  RETURN_ROWS.unshift(slip)
  return slip
}

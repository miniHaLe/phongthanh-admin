/**
 * Mock create-mutation for the Cấp Linh Kiện editor. Appends a new slip to the
 * already-exported, mutable `CHECKOUT_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { CHECKOUT_ROWS } from '@/domains/warehouse/list-data'
import type { CheckOutSlip } from '@/domains/warehouse/types'
import type { CapLinhKienLine } from './stockout-editor-types'

let checkoutSeq = CHECKOUT_ROWS.length

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export interface CreateCheckoutInput {
  kyThuat: string
  ghiChu: string
  nguoiLap: string
  branchId: string
  lines: CapLinhKienLine[]
}

export function createCheckout(input: CreateCheckoutInput): CheckOutSlip {
  checkoutSeq += 1
  const now = new Date().toISOString()
  const soTien = input.lines.reduce((s, l) => s + l.thanhTien, 0)
  const slip: CheckOutSlip = {
    id: `clk-new-${checkoutSeq}`,
    soPhieuCap: `PCH-${ymd(now)}-${checkoutSeq}`,
    ngayLap: now,
    kyThuat: input.kyThuat,
    soTien,
    nguoiLap: input.nguoiLap,
    ghiChu: input.ghiChu,
    branchId: input.branchId,
  }
  CHECKOUT_ROWS.unshift(slip)
  return slip
}

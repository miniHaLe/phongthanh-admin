/**
 * Mock create-mutation for the Cấp Linh Kiện editor. Appends a new slip to the
 * already-exported, mutable `CHECKOUT_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { CHECKOUT_ROWS } from '@/domains/warehouse/list-data'
import type { CheckOutSlip } from '@/domains/warehouse/types'
import { nextVoucherCode } from '@/lib/voucher-code'
import type { CapLinhKienLine } from './stockout-editor-types'

let checkoutIdSeq = CHECKOUT_ROWS.length

export interface CreateCheckoutInput {
  kyThuat: string
  ghiChu: string
  nguoiLap: string
  branchId: string
  lines: CapLinhKienLine[]
}

export function createCheckout(input: CreateCheckoutInput): CheckOutSlip {
  checkoutIdSeq += 1
  const now = new Date()
  const soTien = input.lines.reduce((s, l) => s + l.thanhTien, 0)
  const slip: CheckOutSlip = {
    id: `clk-new-${checkoutIdSeq}`,
    soPhieuCap: nextVoucherCode(
      'PCH',
      CHECKOUT_ROWS.map((row) => row.soPhieuCap),
      now,
    ),
    ngayLap: now.toISOString(),
    kyThuat: input.kyThuat,
    soTien,
    nguoiLap: input.nguoiLap,
    ghiChu: input.ghiChu,
    branchId: input.branchId,
  }
  CHECKOUT_ROWS.unshift(slip)
  return slip
}

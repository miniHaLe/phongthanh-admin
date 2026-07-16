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

function isTrulyBlankLine(line: CapLinhKienLine): boolean {
  return (
    [
      line.serial,
      line.soPhieuSC,
      line.maHang,
      line.tenHang,
      line.nhaSanXuat,
      line.model,
      line.khoId,
      line.khoTen,
      line.nganChuaId,
      line.nganChua,
      line.mucDich,
    ].every((value) => value.trim() === '') &&
    line.gia === 0 &&
    line.thanhTien === 0
  )
}

function normalizeCheckoutLines(lines: CapLinhKienLine[]): CapLinhKienLine[] {
  const nonBlankLines = lines.filter((line) => !isTrulyBlankLine(line))
  if (nonBlankLines.length === 0) {
    throw new Error('Vui lòng chọn sản phẩm cấp cho kỹ thuật!')
  }
  for (const line of nonBlankLines) {
    if (
      !line.soPhieuSC.trim() ||
      !line.maHang.trim() ||
      !line.nhaSanXuat.trim() ||
      !line.khoId.trim() ||
      !line.nganChuaId.trim() ||
      !line.mucDich.trim() ||
      line.soLuong <= 0
    ) {
      throw new Error('Thiếu thông tin dòng cấp linh kiện')
    }
  }
  return nonBlankLines
}

export function createCheckout(input: CreateCheckoutInput): CheckOutSlip {
  const lines = normalizeCheckoutLines(input.lines)
  checkoutIdSeq += 1
  const now = new Date()
  const soTien = lines.reduce((s, l) => s + l.thanhTien, 0)
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
    lines,
  }
  CHECKOUT_ROWS.unshift(slip)
  return slip
}

/**
 * Mock create-mutation for the Nhập Kho editor. Appends a new voucher to the
 * already-exported, mutable `RECEIVING_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { RECEIVING_ROWS } from '@/domains/warehouse/list-data'
import type { ReceivingVoucher, ReceivingLine } from '@/domains/warehouse/types'
import { nextVoucherCode } from '@/lib/voucher-code'

let receivingIdSeq = RECEIVING_ROWS.length

export interface CreateReceivingInput {
  soDatHang: string
  soHoaDon: string
  nhaCungCap: string
  hinhThucThanhToan: string
  khoTen: string
  nguoiLap: string
  ghiChu: string
  branchId: string
  lines: ReceivingLine[]
}

export function createReceiving(input: CreateReceivingInput): ReceivingVoucher {
  receivingIdSeq += 1
  const now = new Date()
  const soTien = input.lines.reduce((s, l) => s + l.thanhTien, 0)
  const voucher: ReceivingVoucher = {
    id: `nk-new-${receivingIdSeq}`,
    soPhieu: nextVoucherCode(
      'PNK',
      RECEIVING_ROWS.map((row) => row.soPhieu),
      now,
    ),
    soDatHang: input.soDatHang,
    soHoaDon: input.soHoaDon,
    nhaCungCap: input.nhaCungCap,
    hinhThucThanhToan: input.hinhThucThanhToan,
    khoTen: input.khoTen,
    soTien,
    nguoiLap: input.nguoiLap,
    ngayLap: now.toISOString(),
    ghiChu: input.ghiChu,
    branchId: input.branchId,
    lines: input.lines,
  }
  RECEIVING_ROWS.unshift(voucher)
  return voucher
}

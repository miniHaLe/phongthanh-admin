/**
 * Mock create-mutation for the Nhập Kho editor. Appends a new voucher to the
 * already-exported, mutable `RECEIVING_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { RECEIVING_ROWS } from '@/domains/warehouse/list-data'
import type { ReceivingVoucher, ReceivingLine } from '@/domains/warehouse/types'

let receivingSeq = RECEIVING_ROWS.length

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

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
  receivingSeq += 1
  const now = new Date().toISOString()
  const soTien = input.lines.reduce((s, l) => s + l.thanhTien, 0)
  const voucher: ReceivingVoucher = {
    id: `nk-new-${receivingSeq}`,
    soPhieu: `PNK-${ymd(now)}-${receivingSeq}`,
    soDatHang: input.soDatHang,
    soHoaDon: input.soHoaDon,
    nhaCungCap: input.nhaCungCap,
    hinhThucThanhToan: input.hinhThucThanhToan,
    khoTen: input.khoTen,
    soTien,
    nguoiLap: input.nguoiLap,
    ngayLap: now,
    ghiChu: input.ghiChu,
    branchId: input.branchId,
    lines: input.lines,
  }
  RECEIVING_ROWS.unshift(voucher)
  return voucher
}

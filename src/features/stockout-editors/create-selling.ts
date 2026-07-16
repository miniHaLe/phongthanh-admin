/**
 * Mock create/update mutations for the Bán Hàng editor. Reads/writes the
 * already-exported, mutable `SELLING_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { SELLING_ROWS } from '@/domains/warehouse/list-data'
import type { SellingLine, SellingOrder } from '@/domains/warehouse/types'
import { nextVoucherCode } from '@/lib/voucher-code'

let sellingIdSeq = SELLING_ROWS.length

export interface SellingInput {
  khachHang: string
  dienThoai: string
  ghiChu: string
  nguoiLap: string
  branchId: string
  hinhThucThanhToan: string
  lines: SellingLine[]
}

export function findSellingOrder(id: string): SellingOrder | undefined {
  return SELLING_ROWS.find((r) => r.id === id)
}

function isBlankLine(line: SellingLine): boolean {
  return (
    [
      line.hangHoaId,
      line.maHang,
      line.tenHang,
      line.model,
      line.serial,
      line.khoId,
      line.khoTen,
    ].every((value) => value.trim() === '') &&
    line.giaVon === 0 &&
    line.giaBan === 0 &&
    line.thanhTien === 0
  )
}

function normalizeSellingLines(lines: SellingLine[]): SellingLine[] {
  const normalized = lines.filter((line) => !isBlankLine(line))
  if (normalized.length === 0) throw new Error('Vui lòng thêm hàng hóa!')
  for (const line of normalized) {
    if (
      !line.hangHoaId.trim() ||
      !line.maHang.trim() ||
      !line.tenHang.trim() ||
      !line.khoId.trim() ||
      line.giaVon < 0 ||
      line.giaBan < 0 ||
      line.soLuong <= 0
    ) {
      throw new Error('Thiếu thông tin dòng bán hàng')
    }
  }
  return normalized.map((line) => ({
    ...line,
    thanhTien: line.giaBan * line.soLuong,
  }))
}

export function createSelling(input: SellingInput): SellingOrder {
  const lines = normalizeSellingLines(input.lines)
  sellingIdSeq += 1
  const now = new Date()
  const order: SellingOrder = {
    id: `bh-new-${sellingIdSeq}`,
    soPhieu: nextVoucherCode(
      'PBH',
      SELLING_ROWS.map((row) => row.soPhieu),
      now,
    ),
    ngayLap: now.toISOString(),
    khachHang: input.khachHang,
    dienThoai: input.dienThoai,
    hinhThucThanhToan: input.hinhThucThanhToan,
    tongTien: lines.reduce((sum, line) => sum + line.thanhTien, 0),
    nguoiLap: input.nguoiLap,
    ghiChu: input.ghiChu,
    branchId: input.branchId,
    lines,
  }
  SELLING_ROWS.unshift(order)
  return order
}

export function updateSelling(id: string, input: SellingInput): SellingOrder | undefined {
  const order = SELLING_ROWS.find((r) => r.id === id)
  if (!order) return undefined
  const lines = normalizeSellingLines(input.lines)
  order.khachHang = input.khachHang
  order.dienThoai = input.dienThoai
  order.hinhThucThanhToan = input.hinhThucThanhToan
  order.tongTien = lines.reduce((sum, line) => sum + line.thanhTien, 0)
  order.ghiChu = input.ghiChu
  order.lines = lines
  return order
}

/**
 * Mock create/update mutations for the Bán Hàng editor. Reads/writes the
 * already-exported, mutable `SELLING_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { SELLING_ROWS } from '@/domains/warehouse/list-data'
import type { SellingOrder } from '@/domains/warehouse/types'

let sellingSeq = SELLING_ROWS.length

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export interface SellingInput {
  khachHang: string
  dienThoai: string
  ghiChu: string
  nguoiLap: string
  branchId: string
  tongTien: number
}

export function findSellingOrder(id: string): SellingOrder | undefined {
  return SELLING_ROWS.find((r) => r.id === id)
}

export function createSelling(input: SellingInput): SellingOrder {
  sellingSeq += 1
  const now = new Date().toISOString()
  const order: SellingOrder = {
    id: `bh-new-${sellingSeq}`,
    soPhieu: `PBH-${ymd(now)}-${sellingSeq}`,
    ngayLap: now,
    khachHang: input.khachHang,
    dienThoai: input.dienThoai,
    tongTien: input.tongTien,
    nguoiLap: input.nguoiLap,
    ghiChu: input.ghiChu,
    branchId: input.branchId,
  }
  SELLING_ROWS.unshift(order)
  return order
}

export function updateSelling(id: string, input: SellingInput): SellingOrder | undefined {
  const order = SELLING_ROWS.find((r) => r.id === id)
  if (!order) return undefined
  order.khachHang = input.khachHang
  order.dienThoai = input.dienThoai
  order.tongTien = input.tongTien
  order.ghiChu = input.ghiChu
  return order
}

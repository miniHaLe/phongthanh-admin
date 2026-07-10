/**
 * Warehouse + stock-out in-memory mutations (D4). Bulk approve / return / carcass
 * flows flip status on the seeded row stores. Module-memory only — lost on any
 * reload; resetDemo regenerates the seed identically.
 */
import { PART_RETURN_ROWS, PART_RETURN_XAC_ROWS, ISSUED_USAGE_ROWS } from './list-data'

const CLOCK = '2024-07-01T00:00:00.000Z'

/** Bulk-approve parts returns: Chờ duyệt → Đã duyệt. Returns count changed. */
export function duyetTraLK(ids: string[]): number {
  const set = new Set(ids)
  let n = 0
  for (const r of PART_RETURN_ROWS) {
    if (set.has(r.id) && r.tinhTrang === 'Chờ duyệt') {
      r.tinhTrang = 'Đã duyệt'
      r.ngayDuyet = CLOCK
      r.nguoiDuyet = 'Hệ thống'
      n++
    }
  }
  return n
}

/** Bulk carcass return: Chưa trả hãng → Đã trả hãng + store the vận đơn. */
export function traHang(ids: string[], maVanDon: string): number {
  const set = new Set(ids)
  let n = 0
  for (const r of PART_RETURN_XAC_ROWS) {
    if (set.has(r.id) && r.tinhTrang === 'Chưa trả hãng') {
      r.tinhTrang = 'Đã trả hãng'
      r.maVanDon = maVanDon
      n++
    }
  }
  return n
}

/** Thu xác a single issued-part usage row (mark carcass recovered). */
export function thuXacLK(id: string): boolean {
  const row = ISSUED_USAGE_ROWS.find((r) => r.id === id)
  if (!row) return false
  row.tinhTrang = 'Đã trả xác LK'
  row.ngayTX = CLOCK
  row.nguoiTX = 'Hệ thống'
  return true
}

/** Return a single issued part (mark có-trả). */
export function traLK(id: string): boolean {
  const row = ISSUED_USAGE_ROWS.find((r) => r.id === id)
  if (!row) return false
  row.tinhTrang = 'Có trả LK'
  row.slTra = row.slTra + 1
  return true
}

/** Spec: Kỳ carry-forward invariants + bulk warehouse mutations. */
import { describe, it, expect } from 'vitest'
import { fetchInventory, inventoryMath } from './mock-data'
import { duyetTraLK, traHang } from './mock-mutations'
import { fetchPartReturnList, fetchPartReturnXacList } from './list-fetchers'

describe('inventory Kỳ carry-forward (Finding 10 math)', () => {
  it('opening stock chains across periods (not two random numbers)', () => {
    const { tonDauKy, deltaFor, kyAsc } = inventoryMath
    // Assert the chain for product 0 across the tracked periods.
    for (let k = 1; k < kyAsc.length; k++) {
      const prev = deltaFor(0, k - 1)
      expect(tonDauKy(0, k)).toBe(tonDauKy(0, k - 1) + prev.nhap - prev.xuat)
    }
  })

  it('closing = opening + nhập − xuất for every row', async () => {
    const res = await fetchInventory({ kind: 'ton-kho', pageSize: 300 })
    for (const r of res.rows) {
      expect(r.tonCuoiKy).toBe(r.tonDauKy + r.nhapTrongKy - r.xuatTrongKy)
    }
  })

  it('KPI trio sums the same rows and can go negative (no clamp)', async () => {
    const res = await fetchInventory({ kind: 'ton-kho', pageSize: 300 })
    const sumClosing = res.rows.reduce((s, r) => s + r.tonCuoiKy, 0)
    expect(res.kpi.tongTon).toBe(sumClosing)
    // Over enough stock-out-heavy periods, at least one row is negative.
    const anyNegative = res.rows.some((r) => r.tonCuoiKy < 0)
    expect(anyNegative).toBe(true)
  })

  it('the technician view carries a Kỹ thuật axis', async () => {
    const res = await fetchInventory({ kind: 'ton-kho-ky-thuat', pageSize: 5 })
    for (const r of res.rows) expect(r.kyThuat).toBeTruthy()
  })
})

describe('warehouse bulk mutations', () => {
  it('duyetTraLK flips Chờ duyệt → Đã duyệt', async () => {
    const before = await fetchPartReturnList({ tinhTrang: 'Chờ duyệt', pageSize: 300 })
    const target = before.data[0]
    expect(target.tinhTrang).toBe('Chờ duyệt')
    const n = duyetTraLK([target.id])
    expect(n).toBe(1)
    expect(target.tinhTrang).toBe('Đã duyệt')
  })

  it('traHang sets Đã trả hãng + stores the vận đơn', async () => {
    const before = await fetchPartReturnXacList({ tinhTrang: 'Chưa trả hãng', pageSize: 300 })
    const target = before.data[0]
    const n = traHang([target.id], 'VD-TEST-1')
    expect(n).toBe(1)
    expect(target.tinhTrang).toBe('Đã trả hãng')
    expect(target.maVanDon).toBe('VD-TEST-1')
  })
})

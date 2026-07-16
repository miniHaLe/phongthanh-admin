/** Spec: Kỳ carry-forward invariants + bulk warehouse mutations. */
import { describe, it, expect } from 'vitest'
import { fetchInventory, inventoryMath } from './mock-data'
import { HANG_HOA_ROWS } from '@/mock/masterdata'
import { NGAN_CHUA_ROWS } from '@/mock/masterdata'
import { duyetTraLK, traHang } from './mock-mutations'
import {
  fetchCheckoutList,
  fetchPartReturnList,
  fetchPartReturnXacList,
  fetchReceivingList,
  fetchSellingList,
} from './list-fetchers'
import { CHECKOUT_ROWS, RECEIVING_ROWS, SELLING_ROWS } from './list-data'

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

  it('caps every period flow by availability so stock never goes negative', () => {
    const { tonDauKy, deltaFor, kyAsc, productCount } = inventoryMath
    for (let product = 0; product < productCount; product += 1) {
      for (let period = 0; period < kyAsc.length; period += 1) {
        const opening = tonDauKy(product, period)
        const delta = deltaFor(product, period)
        expect(opening).toBeGreaterThanOrEqual(0)
        expect(delta.xuat).toBeLessThanOrEqual(opening + delta.nhap)
        expect(opening + delta.nhap - delta.xuat).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('KPI trio sums the same rows and current stock matches sales availability', async () => {
    const res = await fetchInventory({ kind: 'ton-kho', pageSize: 300 })
    const sumClosing = res.rows.reduce((s, r) => s + r.tonCuoiKy, 0)
    expect(res.kpi.tongTon).toBe(sumClosing)
    const salesAvailability = new Map(
      HANG_HOA_ROWS.map((row) => [row.maHH, row.tonKho ?? 0]),
    )
    for (const row of res.rows) {
      expect(row.tonCuoiKy).toBe(salesAvailability.get(row.maHang))
    }
  })

  it('the technician view carries a Kỹ thuật axis', async () => {
    const res = await fetchInventory({ kind: 'ton-kho-ky-thuat', pageSize: 5 })
    for (const r of res.rows) expect(r.kyThuat).toBeTruthy()
  })

  it('uses real warehouse cabinets and filters by nganChuaId', async () => {
    const all = await fetchInventory({ kind: 'ton-kho', pageSize: 300 })
    const target = all.rows[0]
    const cabinet = NGAN_CHUA_ROWS.find((row) => row.id === target.nganChuaId)

    expect(cabinet?.nhaKhoId).toBe(target.khoId)
    const filtered = await fetchInventory({
      kind: 'ton-kho',
      nganChuaId: target.nganChuaId,
      pageSize: 300,
    })
    expect(filtered.rows.length).toBeGreaterThan(0)
    expect(filtered.rows.every((row) => row.nganChuaId === target.nganChuaId)).toBe(
      true,
    )
  })
})

describe('warehouse bulk mutations', () => {
  it('duyetTraLK flips Chờ duyệt → Đã duyệt', async () => {
    const before = await fetchPartReturnList({
      tinhTrang: 'Chờ duyệt',
      pageSize: 300,
    })
    const target = before.data[0]
    expect(target.tinhTrang).toBe('Chờ duyệt')
    const n = duyetTraLK([target.id])
    expect(n).toBe(1)
    expect(target.tinhTrang).toBe('Đã duyệt')
  })

  it('traHang sets Đã trả hãng + stores the vận đơn', async () => {
    const before = await fetchPartReturnXacList({
      tinhTrang: 'Chưa trả hãng',
      pageSize: 300,
    })
    const target = before.data[0]
    const n = traHang([target.id], 'VD-TEST-1')
    expect(n).toBe(1)
    expect(target.tinhTrang).toBe('Đã trả hãng')
    expect(target.maVanDon).toBe('VD-TEST-1')
  })
})

describe('checkout line filters', () => {
  it('persists seeded line detail and narrows every line-level public key', async () => {
    const seed = CHECKOUT_ROWS.find((row) => row.lines.length > 0)
    expect(seed).toBeTruthy()
    const line = seed!.lines[0]
    const cases = {
      khoId: line.khoId,
      mucDich: line.mucDich,
      soPhieuSC: line.soPhieuSC,
      maSanPham: line.maHang,
      nsx: line.nhaSanXuat,
    }

    for (const [key, value] of Object.entries(cases)) {
      const result = await fetchCheckoutList({ [key]: value, pageSize: 300 })
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.length).toBeLessThanOrEqual(CHECKOUT_ROWS.length)
      expect(
        result.data.every((row) =>
          row.lines.some((candidate) =>
            key === 'khoId' || key === 'mucDich'
              ? candidate[key] === value
              : candidate[
                  key === 'soPhieuSC'
                    ? 'soPhieuSC'
                    : key === 'maSanPham'
                      ? 'maHang'
                      : 'nhaSanXuat'
                ]
                  .toLowerCase()
                  .includes(value.toLowerCase()),
          ),
        ),
      ).toBe(true)
    }
  })

  it('requires one checkout line to satisfy all active line filters', async () => {
    const seed = CHECKOUT_ROWS[0]
    const first = { ...seed.lines[0], khoId: 'kho-a', maHang: 'OTHER' }
    const second = { ...seed.lines[0], khoId: 'kho-b', maHang: 'TARGET' }
    const synthetic = {
      ...seed,
      id: 'checkout-cross-line-filter',
      lines: [first, second],
    }
    CHECKOUT_ROWS.unshift(synthetic)

    try {
      const result = await fetchCheckoutList({
        khoId: 'kho-a',
        maSanPham: 'TARGET',
        pageSize: 300,
      })
      expect(result.data).not.toContain(synthetic)
    } finally {
      CHECKOUT_ROWS.splice(CHECKOUT_ROWS.indexOf(synthetic), 1)
    }
  })
})

describe('receiving filters', () => {
  it('persists receiving lines and narrows every public filter key', async () => {
    const seed = RECEIVING_ROWS.find((row) => row.lines.length > 0)!
    const line = seed.lines[0]
    const day = seed.ngayLap.slice(0, 10)
    const cases = [
      fetchReceivingList({ branchId: seed.branchId, pageSize: 300 }),
      fetchReceivingList({
        hinhThucThanhToan: seed.hinhThucThanhToan,
        pageSize: 300,
      }),
      fetchReceivingList({ khoId: seed.khoId, pageSize: 300 }),
      fetchReceivingList({ nganChuaId: line.nganChuaId, pageSize: 300 }),
      fetchReceivingList({ soPhieu: seed.soPhieu, pageSize: 300 }),
      fetchReceivingList({
        soDatHangHoaDon: seed.soHoaDon,
        pageSize: 300,
      }),
      fetchReceivingList({ maSanPham: line.ma, pageSize: 300 }),
      fetchReceivingList({ nhaCungCap: seed.nhaCungCapSdt, pageSize: 300 }),
      fetchReceivingList({ nguoiLap: seed.nguoiLap, pageSize: 300 }),
      fetchReceivingList({ dateFrom: day, dateTo: day, pageSize: 300 }),
    ]

    for (const request of cases) {
      const result = await request
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data).toContain(seed)
    }
  })

  it('requires one receiving line to satisfy all active line filters', async () => {
    const seed = RECEIVING_ROWS[0]
    const first = { ...seed.lines[0], nganChuaId: 'cabinet-a', ma: 'OTHER' }
    const second = { ...seed.lines[0], nganChuaId: 'cabinet-b', ma: 'TARGET' }
    const synthetic = {
      ...seed,
      id: 'receiving-cross-line-filter',
      lines: [first, second],
    }
    RECEIVING_ROWS.unshift(synthetic)

    try {
      const result = await fetchReceivingList({
        nganChuaId: 'cabinet-a',
        maSanPham: 'TARGET',
        pageSize: 300,
      })
      expect(result.data).not.toContain(synthetic)
    } finally {
      RECEIVING_ROWS.splice(RECEIVING_ROWS.indexOf(synthetic), 1)
    }
  })
})

describe('selling filters', () => {
  it('filters header and persisted line fields', async () => {
    const seed = SELLING_ROWS[0]
    const line = seed.lines[0]
    const day = seed.ngayLap.slice(0, 10)
    const cases = [
      fetchSellingList({ branchId: seed.branchId, pageSize: 300 }),
      fetchSellingList({ soPhieu: seed.soPhieu, pageSize: 300 }),
      fetchSellingList({
        hinhThucThanhToan: seed.hinhThucThanhToan,
        pageSize: 300,
      }),
      fetchSellingList({ tenKhachHang: seed.dienThoai, pageSize: 300 }),
      fetchSellingList({ khoId: line.khoId, pageSize: 300 }),
      fetchSellingList({ maHang: line.tenHang, pageSize: 300 }),
      fetchSellingList({ dateFrom: day, dateTo: day, pageSize: 300 }),
    ]

    for (const request of cases) {
      const result = await request
      expect(result.data).toContain(seed)
    }
  })

  it('requires one selling line to satisfy all active line filters', async () => {
    const seed = SELLING_ROWS[0]
    const first = { ...seed.lines[0], khoId: 'kho-a', maHang: 'OTHER' }
    const second = { ...seed.lines[0], khoId: 'kho-b', maHang: 'TARGET' }
    const synthetic = {
      ...seed,
      id: 'selling-cross-line-filter',
      lines: [first, second],
    }
    SELLING_ROWS.unshift(synthetic)

    try {
      const result = await fetchSellingList({
        khoId: 'kho-a',
        maHang: 'TARGET',
        pageSize: 300,
      })
      expect(result.data).not.toContain(synthetic)
    } finally {
      SELLING_ROWS.splice(SELLING_ROWS.indexOf(synthetic), 1)
    }
  })
})

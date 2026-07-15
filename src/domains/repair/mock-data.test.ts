/**
 * Characterization + spec tests for the LIVE repair layer (D5).
 * These run against `MOCK_TICKETS` — the array repair pages actually render —
 * NOT the dead seed arrays. Written parametrized by canonical status exports
 * (via STATUS_LABEL keys) so they survive the legacy-status swap.
 *
 * Spec source: gap matrix §5b (status ids), plan §"Data-Layer Reconciliation (D5)".
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MOCK_TICKETS, createRepairTicket, fetchRepairList } from './mock-data'
import { STATUS_LABEL, KT_BOARD_STATUS_IDS } from './status'
import { TECHNICIANS, PRODUCTS, MODELS } from './reference-data'

/** Valid status values as strings — works for snake slugs AND numeric ids. */
const VALID_STATUS = new Set(Object.keys(STATUS_LABEL).map(String))
const TECH_IDS = new Set(TECHNICIANS.map((t) => t.id))
const PRODUCT_IDS = new Set(PRODUCTS.map((p) => p.id))
const MODEL_IDS = new Set(MODELS.map((m) => m.id))
const BRANCHES = new Set(['dak-lak', 'dak-nong'])

describe('MOCK_TICKETS (live repair layer) — characterization', () => {
  it('holds exactly 250 tickets with unique ids', () => {
    expect(MOCK_TICKETS).toHaveLength(250)
    expect(new Set(MOCK_TICKETS.map((t) => t.id)).size).toBe(250)
  })

  it('is deterministic across a fresh module load', async () => {
    vi.resetModules()
    const reloaded = await import('./mock-data')
    expect(reloaded.MOCK_TICKETS[0].id).toBe(MOCK_TICKETS[0].id)
    expect(reloaded.MOCK_TICKETS[0].soPhieu).toBe(MOCK_TICKETS[0].soPhieu)
    expect(reloaded.MOCK_TICKETS.at(-1)!.id).toBe(MOCK_TICKETS.at(-1)!.id)
  })

  it('keeps all seeded soPhieu values in the legacy PSC-number format', () => {
    expect(MOCK_TICKETS).toHaveLength(250)
    for (const t of MOCK_TICKETS) {
      expect(t.soPhieu).toMatch(/^PSC-\d+$/)
    }
  })

  it('every ticket status is a canonical status value', () => {
    for (const t of MOCK_TICKETS) {
      expect(VALID_STATUS.has(String(t.tinhTrang))).toBe(true)
    }
  })

  it('every relational id resolves against the module generators', () => {
    for (const t of MOCK_TICKETS) {
      expect(BRANCHES.has(t.branchId)).toBe(true)
      expect(TECH_IDS.has(t.kyThuatId)).toBe(true)
      expect(PRODUCT_IDS.has(t.sanPhamId)).toBe(true)
      expect(MODEL_IDS.has(t.modelId)).toBe(true)
    }
  })

  it('statusHistory is non-empty, chronological, and ends at the current status', () => {
    for (const t of MOCK_TICKETS) {
      expect(t.statusHistory.length).toBeGreaterThan(0)
      const times = t.statusHistory.map((h) => new Date(h.changedAt).getTime())
      for (let i = 1; i < times.length; i++) {
        expect(times[i]).toBeGreaterThanOrEqual(times[i - 1])
      }
      expect(t.statusHistory.at(-1)!.status).toBe(t.tinhTrang)
    }
  })
})

describe('createRepairTicket — voucher code format', () => {
  it('creates PSC-yyyymm-1 then PSC-yyyymm-2 and uses the code as id', async () => {
    const product = PRODUCTS[0]
    const model = MODELS.find((item) => item.productId === product.id)!
    const technician = TECHNICIANS[0]
    const now = new Date()
    const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const createdIds: string[] = []
    const input = {
      tenKhach: 'Khách kiểm thử',
      sdt: '0900000000',
      branchId: technician.branchId,
      nhaSanXuatId: model.nhaSanXuatId,
      sanPhamId: product.id,
      modelId: model.id,
      hinhThuc: 'sua_dich_vu' as const,
      kyThuatId: technician.id,
      ngayNhan: now.toISOString(),
      moTaLoi: 'Kiểm thử mã phiếu',
      chiPhiDuKien: 0,
    }

    try {
      const first = await createRepairTicket(input)
      createdIds.push(first.id)
      const second = await createRepairTicket(input)
      createdIds.push(second.id)

      expect(first.soPhieu).toBe(`PSC-${month}-1`)
      expect(first.id).toBe(first.soPhieu)
      expect(second.soPhieu).toBe(`PSC-${month}-2`)
      expect(second.id).toBe(second.soPhieu)
    } finally {
      for (const id of createdIds) {
        const index = MOCK_TICKETS.findIndex((ticket) => ticket.id === id)
        if (index >= 0) MOCK_TICKETS.splice(index, 1)
      }
    }
  })
})

describe('fetchRepairList — characterization', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('honors page/pageSize and returns the correct total', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999) // never trip the 5% error gate
    const res = await fetchRepairList({ page: 1, pageSize: 20 })
    expect(res.data.length).toBeLessThanOrEqual(20)
    expect(res.total).toBe(250)
    expect(res.page).toBe(1)
    expect(res.pageSize).toBe(20)
  })

  it('branch filter returns only matching tickets', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    const res = await fetchRepairList({
      page: 1,
      pageSize: 250,
      branchId: 'dak-lak',
    })
    expect(res.data.length).toBeGreaterThan(0)
    for (const t of res.data) {
      expect(t.branchId).toBe('dak-lak')
    }
  })
})

describe('MOCK_TICKETS (live repair layer) — legacy-status spec (§5b)', () => {
  it('represents all 15 legacy statuses with a nonzero count', () => {
    const counts = new Map<string, number>()
    for (const t of MOCK_TICKETS) {
      const k = String(t.tinhTrang)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    for (const id of Object.keys(STATUS_LABEL)) {
      expect(counts.get(String(id)) ?? 0).toBeGreaterThan(0)
    }
  })

  it('every KT-board status has a count of at least 10 of 250', () => {
    const counts = new Map<string, number>()
    for (const t of MOCK_TICKETS) {
      const k = String(t.tinhTrang)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    for (const id of KT_BOARD_STATUS_IDS) {
      expect(counts.get(String(id)) ?? 0).toBeGreaterThanOrEqual(10)
    }
  })
})

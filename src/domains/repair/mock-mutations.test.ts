/** Spec: repair mock mutations update fields + append history; delete shrinks. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MOCK_TICKETS, fetchRepairList } from './mock-data'
import {
  updateTicketStatus,
  dispatchTechnician,
  cancelDispatch,
  transferBranch,
  deleteTickets,
  checkoutDelivery,
} from './mock-mutations'
import { TECHNICIANS } from './reference-data'

describe('mock mutations', () => {
  it('updateTicketStatus sets status + appends a history entry', () => {
    const t = MOCK_TICKETS[0]
    const beforeLen = t.statusHistory.length
    updateTicketStatus([t.id], 9, { cachGiaiQuyet: 'Đã sửa' })
    expect(t.tinhTrang).toBe(9)
    expect(t.statusHistory.length).toBe(beforeLen + 1)
    expect(t.statusHistory.at(-1)!.status).toBe(9)
  })

  it('dispatchTechnician assigns the technician', () => {
    const t = MOCK_TICKETS[1]
    const tech = TECHNICIANS[0]
    dispatchTechnician([t.id], tech.id)
    expect(t.kyThuatId).toBe(tech.id)
    expect(t.kyThuat).toBe(tech.ten)
  })

  it('cancelDispatch clears the technician', () => {
    const t = MOCK_TICKETS[2]
    dispatchTechnician([t.id], TECHNICIANS[0].id)
    cancelDispatch(t.id)
    expect(t.kyThuatId).toBe('')
  })

  it('transferBranch moves the ticket + records history', () => {
    const t = MOCK_TICKETS[3]
    const beforeLen = t.statusHistory.length
    transferBranch([t.id], 'dak-nong', 'lý do')
    expect(t.branchId).toBe('dak-nong')
    expect(t.statusHistory.length).toBe(beforeLen + 1)
  })

  it('checkoutDelivery sets status 10 + ngayGiao', () => {
    const t = MOCK_TICKETS[4]
    checkoutDelivery(t.id, { ngayGiao: '2024-07-01', ghiChu: 'x' })
    expect(t.tinhTrang).toBe(10)
    expect(t.ngayGiao).toBe('2024-07-01')
  })

  it('deleteTickets removes rows from the store', () => {
    const before = MOCK_TICKETS.length
    const victim = MOCK_TICKETS[MOCK_TICKETS.length - 1].id
    const removed = deleteTickets([victim])
    expect(removed).toBe(1)
    expect(MOCK_TICKETS.length).toBe(before - 1)
    expect(MOCK_TICKETS.some((t) => t.id === victim)).toBe(false)
  })
})

describe('fetchRepairList statusCounts + dateType', () => {
  // Pin Math.random below the 5% error-injection threshold so fetchRepairList
  // never throws mid-test (mockDelay/maybeThrow both read Math.random).
  beforeEach(() => vi.spyOn(Math, 'random').mockReturnValue(0.999))
  afterEach(() => vi.restoreAllMocks())

  it('returns statusCounts that ignore the status filter but respect others', async () => {
    const res = await fetchRepairList({
      page: 1,
      pageSize: 10,
      branchId: 'dak-lak',
      tinhTrang: 1,
    })
    // Counts should include statuses other than the filtered one.
    const keys = Object.keys(res.statusCounts)
    expect(keys.length).toBeGreaterThan(1)
  })

  it('dateType: giao filters on ngayGiao', async () => {
    const res = await fetchRepairList({
      page: 1,
      pageSize: 300,
      dateType: 'giao',
      dateFrom: '2020-01-01',
      dateTo: '2030-01-01',
    })
    // Only tickets that HAVE a ngayGiao survive a giao-date range.
    for (const t of res.data) expect(t.ngayGiao).toBeTruthy()
  })
})

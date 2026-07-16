/** Spec: repair mock mutations update fields + append history; delete shrinks. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  MOCK_TICKETS,
  REPAIR_MOCK_REFERENCE_EPOCH_MS,
  fetchRepairList,
} from './mock-data'
import {
  updateTicketStatus,
  dispatchTechnician,
  cancelDispatch,
  transferBranch,
  deleteTickets,
  checkoutDelivery,
  updateRepairTicket,
} from './mock-mutations'
import { TECHNICIANS } from './reference-data'
import { computeMayTonAging } from '@/domains/reports/aging-buckets'

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

  it('uses the report epoch for a new status transition', () => {
    const ticket = MOCK_TICKETS[5]
    const original = structuredClone(ticket)
    try {
      updateTicketStatus([ticket.id], 4)

      expect(ticket.statusHistory.at(-1)?.changedAt).toBe(
        new Date(REPAIR_MOCK_REFERENCE_EPOCH_MS).toISOString(),
      )
      const row = computeMayTonAging(
        [ticket],
        new Date(REPAIR_MOCK_REFERENCE_EPOCH_MS),
      ).find((candidate) => candidate.statusId === 4)!
      expect(row.day1).toBe(1)
      expect(row.day31Plus).toBe(0)
    } finally {
      Object.assign(ticket, original)
    }
  })

  it('deleteTickets removes rows from the store', () => {
    const before = MOCK_TICKETS.length
    const victim = MOCK_TICKETS[MOCK_TICKETS.length - 1].id
    const removed = deleteTickets([victim])
    expect(removed).toBe(1)
    expect(MOCK_TICKETS.length).toBe(before - 1)
    expect(MOCK_TICKETS.some((t) => t.id === victim)).toBe(false)
  })

  it('updates editable ticket fields without creating phantom status history', async () => {
    const ticket = MOCK_TICKETS[0]
    const original = structuredClone(ticket)
    try {
      const historyBefore = structuredClone(ticket.statusHistory)
      const updated = await updateRepairTicket(ticket.id, {
        khachHangId: ticket.khachHangId,
        tenKhach: 'Khách đã sửa',
        sdt: '0900000001',
        diaChi: 'Địa chỉ mới',
        branchId: ticket.branchId,
        nhaSanXuatId: ticket.nhaSanXuatId,
        sanPhamId: ticket.sanPhamId,
        modelId: ticket.modelId,
        soSerial: 'SERIAL-EDIT',
        hinhThuc: ticket.hinhThuc,
        loaiBaoHanh: 'nha_khach',
        warrantyAt: 1,
        ngayNhan: ticket.ngayNhan,
        ngayHenTra: ticket.ngayHenTra,
        moTaLoi: 'Mô tả đã sửa',
        ghiChuNhaSanXuat: 'Ghi chú NSX',
        ghiChuModel: 'Ghi chú model',
        tuyen: 'Tuyến 3',
        daiLyId: 'kh-2',
        daiLy: 'Đại lý A',
        dienThoai2: '0900000002',
        email: 'edited@example.com',
      })

      expect(updated).toMatchObject({
        soSerial: 'SERIAL-EDIT',
        moTaLoi: 'Mô tả đã sửa',
        ghiChuNhaSanXuat: 'Ghi chú NSX',
        ghiChuModel: 'Ghi chú model',
        tuyen: 'Tuyến 3',
        daiLyId: 'kh-2',
        dienThoai2: '0900000002',
        email: 'edited@example.com',
      })
      expect(updated.statusHistory).toEqual(historyBefore)
      expect(updated.tinhTrang).toBe(original.tinhTrang)
      expect(updated.chiPhiThucTe).toBe(original.chiPhiThucTe)
      expect(updated.parts).toEqual(original.parts)
    } finally {
      Object.assign(ticket, original)
    }
  })

  it('applies explicit null clears from the edit contract', async () => {
    const ticket = MOCK_TICKETS[6]
    const original = structuredClone(ticket)
    try {
      ticket.ghiChu = 'Ghi chú cũ'
      ticket.daiLyId = 'kh-2'
      ticket.daiLy = 'Đại lý A'
      ticket.email = 'old@example.com'

      await updateRepairTicket(ticket.id, {
        khachHangId: ticket.khachHangId,
        tenKhach: ticket.khachHang.ten,
        sdt: ticket.khachHang.sdt,
        diaChi: ticket.khachHang.diaChi,
        branchId: ticket.branchId,
        nhaSanXuatId: ticket.nhaSanXuatId,
        sanPhamId: ticket.sanPhamId,
        modelId: ticket.modelId,
        hinhThuc: ticket.hinhThuc,
        loaiBaoHanh: ticket.loaiBaoHanh,
        warrantyAt: ticket.warrantyAt,
        isQuick: ticket.isQuick,
        khuVuc: ticket.khuVuc ?? null,
        ngayNhan: ticket.ngayNhan,
        moTaLoi: ticket.moTaLoi,
        ghiChu: null,
        daiLyId: null,
        daiLy: null,
        email: null,
      })

      expect(ticket).toMatchObject({
        ghiChu: undefined,
        daiLyId: undefined,
        daiLy: undefined,
        email: undefined,
      })
    } finally {
      Object.assign(ticket, original)
    }
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

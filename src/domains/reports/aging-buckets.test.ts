import { describe, expect, it } from 'vitest'
import type { RepairTicket } from '@/domains/repair/types'
import {
  classifyMayTonAgeUsingUnverifiedCandidateRanges,
  computeKpiAging,
  computeMayTonAging,
  selectMayTonDrilldownTickets,
} from './aging-buckets'

const AS_OF = '2026-07-15T12:00:00.000Z'

function ticket(overrides: Partial<RepairTicket>): RepairTicket {
  return {
    id: 'ticket',
    soPhieu: 'PSC-TEST',
    branchId: 'dak-lak',
    hinhThuc: 'sua_dich_vu',
    tinhTrang: 1,
    isOverdue: false,
    khachHangId: 'customer',
    khachHang: {
      id: 'customer',
      ten: 'Khách kiểm thử',
      sdt: '0900000000',
      diaChi: 'Địa chỉ',
      tinh: 'Đắk Lắk',
      huyen: 'Buôn Ma Thuột',
    },
    nhaSanXuatId: 'manufacturer',
    sanPhamId: 'product',
    modelId: 'model',
    tenSanPham: 'Tivi kiểm thử',
    kyThuatId: 'technician',
    kyThuat: 'Kỹ thuật A',
    moTaLoi: 'Lỗi kiểm thử',
    loiSuaChua: [],
    chiPhiDuKien: 0,
    chiPhiThucTe: 0,
    chiPhiLinhKien: 0,
    chiPhiNhanCong: 0,
    nguoiNhan: 'Tiếp tân A',
    ngayNhan: '2026-07-01T12:00:00.000Z',
    statusHistory: [
      {
        status: 1,
        changedAt: '2026-07-01T12:00:00.000Z',
        changedBy: 'Người kiểm thử',
      },
    ],
    parts: [],
    createdAt: '2026-07-01T12:00:00.000Z',
    updatedAt: '2026-07-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('computeKpiAging', () => {
  it('places same-day through day-eight completions in the legacy disjoint buckets', () => {
    const tickets = Array.from({ length: 9 }, (_, ageDays) =>
      ticket({
        id: `ticket-${ageDays}`,
        soPhieu: `PSC-${ageDays}`,
        ngayNhan: '2026-07-01T12:00:00.000Z',
        ngayHoanThanh: new Date(
          Date.parse('2026-07-01T12:00:00.000Z') + ageDays * 86_400_000,
        ).toISOString(),
      }),
    )

    const [row] = computeKpiAging(tickets, {
      personKey: 'technician',
      from: '2026-07-01',
      to: '2026-07-31',
    })

    expect(row).toMatchObject({
      personId: 'technician',
      personName: 'Kỹ thuật A',
      day1: 2,
      day2: 1,
      day3: 1,
      day4: 1,
      day5: 1,
      day6: 1,
      day7: 1,
      over7: 1,
      total: 9,
    })
  })

  it('groups by receiver and applies completion-date, branch, and person filters', () => {
    const rows = computeKpiAging(
      [
        ticket({ id: 'included', ngayHoanThanh: '2026-07-10T12:00:00.000Z' }),
        ticket({
          id: 'wrong-branch',
          branchId: 'dak-nong',
          ngayHoanThanh: '2026-07-10T12:00:00.000Z',
        }),
        ticket({
          id: 'outside-period',
          nguoiNhan: 'Tiếp tân B',
          ngayHoanThanh: '2026-06-30T12:00:00.000Z',
        }),
      ],
      {
        personKey: 'receiver',
        from: '2026-07-01',
        to: '2026-07-31',
        branchId: 'dak-lak',
        personIds: ['Tiếp tân A'],
      },
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      personId: 'Tiếp tân A',
      personName: 'Tiếp tân A',
      total: 1,
    })
  })
})

describe('candidate May Ton aging ranges', () => {
  it.each([
    [0, 'day1'],
    [1, 'day1'],
    [2, 'day3'],
    [3, 'day3'],
    [4, 'day7'],
    [7, 'day7'],
    [8, 'day14'],
    [14, 'day14'],
    [15, 'day21'],
    [21, 'day21'],
    [22, 'day30'],
    [30, 'day30'],
    [31, 'day31Plus'],
  ] as const)('maps age %i to %s', (ageDays, bucket) => {
    expect(classifyMayTonAgeUsingUnverifiedCandidateRanges(ageDays)).toBe(
      bucket,
    )
  })

  it('keeps all-time totals independent from the selected receive-date window', () => {
    const recent = ticket({
      id: 'recent',
      ngayNhan: '2026-07-10T12:00:00.000Z',
      statusHistory: [
        {
          status: 1,
          changedAt: '2026-07-15T12:00:00.000Z',
          changedBy: 'Người kiểm thử',
        },
      ],
    })
    const old = ticket({
      id: 'old',
      ngayNhan: '2026-01-01T12:00:00.000Z',
      statusHistory: [
        {
          status: 1,
          changedAt: '2026-06-01T12:00:00.000Z',
          changedBy: 'Người kiểm thử',
        },
      ],
    })

    const row = computeMayTonAging([recent, old], AS_OF, {
      from: '2026-07-01',
      to: '2026-07-31',
    }).find((candidate) => candidate.statusId === 1)!

    expect(row.total).toBe(2)
    expect(row.day1).toBe(1)
    expect(row.day31Plus).toBe(0)
  })

  it('returns exactly the tickets counted by a selected status and bucket cell', () => {
    const tickets = [0, 1, 2, 3, 31].map((ageDays) =>
      ticket({
        id: `ticket-${ageDays}`,
        soPhieu: `PSC-${ageDays}`,
        statusHistory: [
          {
            status: 1,
            changedAt: new Date(
              Date.parse(AS_OF) - ageDays * 86_400_000,
            ).toISOString(),
            changedBy: 'Người kiểm thử',
          },
        ],
      }),
    )

    const row = computeMayTonAging(tickets, AS_OF).find(
      (candidate) => candidate.statusId === 1,
    )!
    const selected = selectMayTonDrilldownTickets(tickets, AS_OF, {
      statusId: 1,
      bucket: 'day3',
    })

    expect(row.day3).toBe(2)
    expect(selected.map((item) => item.id)).toEqual(['ticket-2', 'ticket-3'])
  })

  it('keeps the start of the current status when same-status notes are appended', () => {
    const row = computeMayTonAging(
      [
        ticket({
          tinhTrang: 4,
          statusHistory: [
            {
              status: 1,
              changedAt: '2026-06-01T12:00:00.000Z',
              changedBy: 'Người kiểm thử',
            },
            {
              status: 4,
              changedAt: '2026-07-05T12:00:00.000Z',
              changedBy: 'Người kiểm thử',
            },
            {
              status: 4,
              changedAt: AS_OF,
              changedBy: 'Người kiểm thử',
              note: 'Chuyển chi nhánh không đổi tình trạng',
            },
          ],
        }),
      ],
      AS_OF,
    ).find((candidate) => candidate.statusId === 4)!

    expect(row.day14).toBe(1)
    expect(row.day1).toBe(0)
  })
})

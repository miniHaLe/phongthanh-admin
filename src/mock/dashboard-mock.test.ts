/**
 * Characterization + spec tests for the LIVE dashboard layer.
 * Overdue is a seeded field (no wall clock); queue tiles + open counts run on
 * legacy status ids.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  fetchDashboardSummary,
  fetchRecentTickets,
  fetchStatusDistribution,
} from './dashboard-mock'
import { STATUS_LABEL, OPEN_STATUS_IDS } from '@/domains/repair/status'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'

const VALID_IDS = new Set(Object.keys(STATUS_LABEL).map(Number))

describe('fetchDashboardSummary — characterization', () => {
  it('returns a 4-tile queue and per-branch numeric counts', async () => {
    const summary = await fetchDashboardSummary('all')
    expect(summary.queue).toHaveLength(4)
    for (const q of summary.queue) {
      expect(VALID_IDS.has(q.status)).toBe(true)
      expect(q.count).toBe(
        MOCK_TICKETS.filter((ticket) => ticket.tinhTrang === q.status).length,
      )
    }
    for (const b of summary.branches) {
      const branchTickets = MOCK_TICKETS.filter(
        (ticket) => ticket.branchId === b.branchId,
      )
      expect(b.openCount).toBe(
        branchTickets.filter((ticket) =>
          OPEN_STATUS_IDS.includes(ticket.tinhTrang),
        ).length,
      )
      expect(b.overdueCount).toBe(
        branchTickets.filter((ticket) => ticket.isOverdue).length,
      )
    }
  })
})

describe('fetchDashboardSummary — legacy-id spec', () => {
  it('queue statuses are the legacy ids [1,2,7,9]', async () => {
    const summary = await fetchDashboardSummary('all')
    expect(summary.queue.map((q) => q.status)).toEqual([1, 2, 7, 9])
  })

  it('open counts are bounded by the open-status set (no delivered/cancelled)', async () => {
    const summary = await fetchDashboardSummary('all')
    const openSet = new Set<number>(OPEN_STATUS_IDS)
    // Every open id is valid; 10 and 12 are excluded by definition.
    expect(openSet.has(10)).toBe(false)
    expect(openSet.has(12)).toBe(false)
    for (const b of summary.branches) {
      expect(b.openCount).toBeGreaterThanOrEqual(0)
    }
  })

  it('overdueCount is a deterministic seeded field, nonzero across calls', async () => {
    // A seeded field means the total never drifts between calls — a wall-clock
    // "older than N days" rule would drift as the mocked clock advances.
    const later = 32_000_000_000_000 // far-future timestamp
    const a = await fetchDashboardSummary('all')
    const totalA = a.branches.reduce((s, x) => s + x.overdueCount, 0)
    vi.spyOn(Date, 'now').mockReturnValue(later)
    const b = await fetchDashboardSummary('all')
    const totalB = b.branches.reduce((s, x) => s + x.overdueCount, 0)
    vi.restoreAllMocks()
    expect(totalA).toBeGreaterThan(0)
    expect(totalB).toBe(totalA)
  })
})

describe('fetchRecentTickets', () => {
  it('returns recent rows backed by real repair ticket ids', async () => {
    const recent = await fetchRecentTickets()
    const expectedIds = [...MOCK_TICKETS]
      .sort(
        (a, b) =>
          new Date(b.ngayNhan).getTime() - new Date(a.ngayNhan).getTime() ||
          a.id.localeCompare(b.id),
      )
      .slice(0, 10)
      .map((ticket) => ticket.id)

    expect(recent).toHaveLength(10)
    expect(recent.map((ticket) => ticket.id)).toEqual(expectedIds)
  })
})

describe('fetchStatusDistribution — legacy-id spec', () => {
  it('emits only canonical ids with labels from STATUS_LABEL', async () => {
    const dist = await fetchStatusDistribution()
    expect(dist.length).toBeGreaterThan(0)
    for (const d of dist) {
      expect(VALID_IDS.has(d.status)).toBe(true)
      expect(d.label).toBe(STATUS_LABEL[d.status])
      expect(d.count).toBe(
        MOCK_TICKETS.filter((ticket) => ticket.tinhTrang === d.status).length,
      )
    }
  })
})

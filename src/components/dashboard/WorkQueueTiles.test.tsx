/** Render test: 4 queue tiles, each showing its count + canonical status label. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { WorkQueueTiles } from './WorkQueueTiles'
import { STATUS_LABEL } from '@/domains/repair/status'
import type { DashboardSummary } from '@/types/dashboard-types'

const summary: DashboardSummary = {
  queue: [
    { status: 1, count: 11, trend: 2 },
    { status: 2, count: 22, trend: 0 },
    { status: 7, count: 33, trend: -1 },
    { status: 9, count: 44, trend: 3 },
  ],
  todayReceipts: 5,
  todayReceiptsTrend: 1,
  branches: [],
}

describe('WorkQueueTiles', () => {
  it('renders 4 tiles with each count and its canonical status label', () => {
    renderWithProviders(<WorkQueueTiles summary={summary} />)
    for (const q of summary.queue) {
      expect(screen.getByText(String(q.count))).toBeInTheDocument()
      expect(screen.getByText(STATUS_LABEL[q.status])).toBeInTheDocument()
    }
  })
})

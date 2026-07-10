/**
 * Spec: ReportDrilldown renders the heading + the ticket rows in the shared
 * results table (Số phiếu, Khách hàng, Tình trạng columns).
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { ReportDrilldown } from './report-drilldown'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'

describe('ReportDrilldown', () => {
  it('renders the heading and the ticket rows', () => {
    const tickets = MOCK_TICKETS.slice(0, 3)
    renderWithProviders(
      <ReportDrilldown title="Danh sách phiếu — Sửa Xong" tickets={tickets} />,
    )
    expect(screen.getByText('Danh sách phiếu — Sửa Xong')).toBeInTheDocument()
    for (const t of tickets) {
      expect(screen.getByText(t.soPhieu)).toBeInTheDocument()
    }
  })

  it('renders an empty table when tickets is empty', () => {
    renderWithProviders(<ReportDrilldown title="Danh sách phiếu" tickets={[]} />)
    expect(screen.getByText('Danh sách phiếu')).toBeInTheDocument()
    expect(screen.getByText('Số phiếu')).toBeInTheDocument()
  })
})

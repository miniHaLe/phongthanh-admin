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
  it('renders the exact 14 legacy drill-down headers in order', () => {
    renderWithProviders(
      <ReportDrilldown
        title="Danh sách phiếu"
        tickets={MOCK_TICKETS.slice(0, 1)}
      />,
    )
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual([
      '#',
      '#',
      'Phiếu sửa chữa',
      'Khách hàng',
      'Thông tin sản phẩm',
      'Kỹ thuật',
      'Loại SC',
      'Chi phí',
      'Ngày nhận',
      'Ngày giao',
      'Chi tiết SC',
      'Ghi chú',
      'Người nhận',
      'Khu vực',
    ])
  })

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
    renderWithProviders(
      <ReportDrilldown title="Danh sách phiếu" tickets={[]} />,
    )
    expect(screen.getByText('Danh sách phiếu')).toBeInTheDocument()
    expect(screen.getByText('Phiếu sửa chữa')).toBeInTheDocument()
  })
})

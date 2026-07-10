/**
 * Spec: StatusPieChart renders the title + "Không có dữ liệu" empty state.
 * Recharts needs a sized container in happy-dom, so assertions target the
 * surrounding DOM rather than SVG slice geometry.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { StatusPieChart } from './status-pie-chart'

describe('StatusPieChart', () => {
  it('renders the title', () => {
    renderWithProviders(
      <StatusPieChart title="Báo cáo tình trạng chung" data={[]} />,
    )
    expect(screen.getByText('Báo cáo tình trạng chung')).toBeInTheDocument()
  })

  it('renders "Không có dữ liệu" when data is empty', () => {
    renderWithProviders(<StatusPieChart title="Test" data={[]} />)
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
  })

  it('does not render the empty state when data is present', () => {
    renderWithProviders(
      <StatusPieChart
        title="Test"
        data={[{ label: 'Mới Nhận', count: 3, color: '#FFCC00', key: 1 }]}
      />,
    )
    expect(screen.queryByText('Không có dữ liệu')).not.toBeInTheDocument()
  })

  it('calls onSliceClick with the clicked datum (fixed numeric size for happy-dom SVG layout)', async () => {
    const user = userEvent.setup()
    const onSliceClick = vi.fn()
    const { container } = renderWithProviders(
      <StatusPieChart
        title="Test"
        data={[{ label: 'Mới Nhận', count: 3, color: '#FFCC00', key: 1 }]}
        onSliceClick={onSliceClick}
        width={400}
        height={300}
      />,
    )
    const sector = container.querySelector('.recharts-pie-sector path')
    expect(sector).toBeTruthy()
    await user.click(sector!)
    expect(onSliceClick).toHaveBeenCalledTimes(1)
  })
})

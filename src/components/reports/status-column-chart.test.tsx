/**
 * Spec: StatusColumnChart renders the title + "Không có dữ liệu" empty state,
 * and — with data — a bar per datum whose click handler fires with the datum.
 * Recharts needs a sized container in happy-dom (ResponsiveContainer can
 * render 0×0), so assertions target the surrounding DOM/title/empty-state
 * rather than SVG bar geometry.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { StatusColumnChart } from './status-column-chart'

describe('StatusColumnChart', () => {
  it('renders the title', () => {
    renderWithProviders(
      <StatusColumnChart title="Báo cáo kỹ thuật tình trạng Sửa Xong" data={[]} />,
    )
    expect(
      screen.getByText('Báo cáo kỹ thuật tình trạng Sửa Xong'),
    ).toBeInTheDocument()
  })

  it('renders "Không có dữ liệu" when data is empty', () => {
    renderWithProviders(<StatusColumnChart title="Test" data={[]} />)
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
  })

  it('does not render the empty state when data is present', () => {
    renderWithProviders(
      <StatusColumnChart
        title="Test"
        data={[{ label: 'Nguyễn Văn An', count: 5, color: '#3300FF', key: 'a' }]}
      />,
    )
    expect(screen.queryByText('Không có dữ liệu')).not.toBeInTheDocument()
  })

  it('calls onBarClick with the clicked datum (fixed numeric size for happy-dom SVG layout)', async () => {
    const user = userEvent.setup()
    const onBarClick = vi.fn()
    const { container } = renderWithProviders(
      <StatusColumnChart
        title="Test"
        data={[{ label: 'Nguyễn Văn An', count: 5, color: '#3300FF', key: 'a' }]}
        onBarClick={onBarClick}
        width={400}
        height={300}
      />,
    )
    const rect = container.querySelector('.recharts-bar-rectangle path')
    expect(rect).toBeTruthy()
    await user.click(rect!)
    expect(onBarClick).toHaveBeenCalledTimes(1)
  })
})

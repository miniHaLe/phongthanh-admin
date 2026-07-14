/** Spec: legend renders 15 statuses in display order with counts + endpoints. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatusLegend } from './status-legend'
import { REPAIR_STATUS_DISPLAY_ORDER } from '@/domains/repair/status'

describe('StatusLegend with counts', () => {
  it('renders all 15 statuses in the repair-list display order', () => {
    expect(REPAIR_STATUS_DISPLAY_ORDER).toEqual([
      1, 2, 4, 15, 6, 17, 13, 7, 8, 11, 16, 9, 10, 12, 14,
    ])
  })

  it('shows "Label (count)" for each status', () => {
    const counts = { 1: 22, 14: 3 }
    render(<StatusLegend counts={counts} />)
    expect(screen.getByText('Mới Nhận (22)')).toBeInTheDocument()
    expect(screen.getByText('Đã Giao Ngoài (3)')).toBeInTheDocument()
  })

  it('collapses counted legends on mobile behind an accessible disclosure', async () => {
    const user = userEvent.setup()
    render(<StatusLegend counts={{}} />)

    const disclosure = screen.getByRole('button', {
      name: 'Chú thích trạng thái',
    })
    const content = document.getElementById(
      disclosure.getAttribute('aria-controls')!,
    )!
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(disclosure).toHaveClass('md:hidden')
    expect(content).toHaveClass('hidden', 'md:flex')

    await user.click(disclosure)
    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(content).not.toHaveClass('hidden')
  })

  it('keeps the uncounted gallery legend always visible', () => {
    render(<StatusLegend />)
    expect(
      screen.queryByRole('button', { name: 'Chú thích trạng thái' }),
    ).not.toBeInTheDocument()
  })
})

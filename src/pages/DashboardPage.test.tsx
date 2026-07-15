/** Dashboard is a single view with one-click access to the full plan calendar. */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  it('renders one view and opens the plan calendar in one click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardPage />)
    await waitFor(
      () => expect(screen.getByText('Kế hoạch nhanh')).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-dashboard-today-receipts]'),
    ).toHaveClass('xl:col-span-4')

    await user.click(screen.getByRole('button', { name: 'Mở lịch kế hoạch' }))
    expect(
      screen.getByRole('dialog', { name: 'Kế hoạch của bạn' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Tháng 7/2026')).toBeInTheDocument()
  })
})

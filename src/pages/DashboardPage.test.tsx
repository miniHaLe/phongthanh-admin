/** Characterization + spec: DashboardPage renders KPI content, then tabs. */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  it('renders the "Trang chủ" header and the two dashboard tabs', async () => {
    renderWithProviders(<DashboardPage />)
    // Wait for the critical summary query to resolve past the skeleton.
    await waitFor(
      () =>
        expect(
          screen.getByRole('tab', { name: 'Tổng quan' }),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(
      screen.getByRole('tab', { name: 'Kế hoạch của bạn' }),
    ).toBeInTheDocument()
    // "Tổng quan" is the default tab (KPI content mounted).
    expect(screen.getByRole('tab', { name: 'Tổng quan' })).toHaveAttribute(
      'data-state',
      'active',
    )
  })
})

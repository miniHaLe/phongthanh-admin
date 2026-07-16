import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import RepairListPage from './RepairListPage'

vi.mock('@/domains/repair/mock-data', async (original) => {
  const actual = await original<typeof import('@/domains/repair/mock-data')>()
  return {
    ...actual,
    fetchRepairList: vi.fn(async () => ({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      statusCounts: {},
    })),
  }
})

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>
}

describe('RepairListPage actions', () => {
  it('owns one Lập phiếu action plus legacy search/reload controls', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <RepairListPage />
        <LocationProbe />
      </>,
      { route: ROUTES.repairList },
    )

    const createButtons = screen.getAllByRole('button', { name: 'Lập phiếu' })
    expect(createButtons).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tải lại trang' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Thao tác hàng loạt' }),
    ).not.toBeInTheDocument()

    await user.click(createButtons[0])
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        ROUTES.repairCreate,
      ),
    )
  })
})

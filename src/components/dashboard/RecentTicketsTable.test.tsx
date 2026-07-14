import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import type { RecentTicket } from '@/types/dashboard-types'
import { RecentTicketsTable } from './RecentTicketsTable'

const staleTicket: RecentTicket = {
  id: 'missing-ticket',
  ticketCode: 'PSC-MISSING-001',
  customerName: 'Khách cũ',
  productName: 'Máy lạnh',
  technicianName: 'Kỹ thuật A',
  status: 1,
  receivedDate: '2026-07-13T08:00:00.000Z',
  branchId: 'dak-lak',
}

function Harness() {
  const location = useLocation()
  return (
    <>
      <RecentTicketsTable
        tickets={[staleTicket]}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
      />
      <output aria-label="current-location">
        {location.pathname}
        {location.search}
      </output>
    </>
  )
}

describe('RecentTicketsTable', () => {
  it('routes a stale row to the repair list with its ticket code prefilled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.click(screen.getByText(staleTicket.ticketCode))

    expect(screen.getByLabelText('current-location')).toHaveTextContent(
      '/sua-chua-bao-hanh?soPhieu=PSC-MISSING-001',
    )
  })
})

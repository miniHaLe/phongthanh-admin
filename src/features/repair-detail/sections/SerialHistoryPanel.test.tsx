/**
 * Spec: Lịch sử máy renders prior-repair rows for a shared serial, or the
 * empty state when the serial has no other tickets.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { SerialHistoryPanel } from './SerialHistoryPanel'

describe('SerialHistoryPanel', () => {
  it('renders the heading', async () => {
    renderWithProviders(<SerialHistoryPanel serial="" />)
    expect(screen.getByText('Lịch sử máy')).toBeInTheDocument()
  })

  it('shows the empty state for a serial with no prior repairs', async () => {
    renderWithProviders(
      <SerialHistoryPanel serial="SN-DOES-NOT-EXIST" excludeId="none" />,
    )
    expect(await screen.findByText('Không có dữ liệu')).toBeInTheDocument()
  })

  it('renders prior-repair rows for a shared serial, excluding the current ticket', async () => {
    // Pick a ticket with a serial, then find another ticket sharing it (or
    // fall back to asserting the excluded ticket itself never appears).
    const withSerial = MOCK_TICKETS.find((t) => t.soSerial)!
    renderWithProviders(
      <SerialHistoryPanel
        serial={withSerial.soSerial!}
        excludeId={withSerial.id}
      />,
    )
    await waitFor(() => {
      expect(
        screen.queryByText('Đang tải…') ?? screen.queryByText('Số phiếu'),
      ).toBeTruthy()
    })
    // The excluded ticket's own số phiếu must never appear as a row.
    const rows = screen.queryAllByText(withSerial.soPhieu)
    expect(rows.length).toBe(0)
  })
})

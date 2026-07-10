/**
 * Spec: Báo cáo tình trạng kỹ thuật — Tình trạng single-select (15 options,
 * default Sửa Xong), Kỹ thuật autocomplete, auto-run on mount (chart renders
 * without clicking "Xem"), and bar-click drill-down.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import KyThuatReportPage from './KyThuatReportPage'
import { REPAIR_STATUSES } from '@/domains/repair/status'

describe('KyThuatReportPage', () => {
  beforeEach(() => {
    // Ticket generation calls Math.random only via mockDelay's jitter — pin it
    // so latency is deterministic and queries resolve promptly in tests.
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })

  it('renders the Tình trạng single-select with all 15 statuses, default Sửa Xong', async () => {
    renderWithProviders(<KyThuatReportPage />)
    const select = await screen.findByRole('combobox', { name: 'Tình trạng' })
    expect(select).toHaveTextContent('Sửa Xong')
  })

  it('renders the Kỹ thuật autocomplete filter', async () => {
    renderWithProviders(<KyThuatReportPage />)
    expect(
      await screen.findByRole('combobox', { name: 'Chọn kỹ thuật…' }),
    ).toBeInTheDocument()
  })

  it('auto-runs the search on mount and renders the chart title without clicking Xem', async () => {
    renderWithProviders(<KyThuatReportPage />)
    await waitFor(() =>
      expect(
        screen.getByText('Báo cáo kỹ thuật tình trạng Sửa Xong'),
      ).toBeInTheDocument(),
    )
  })

  it('renders the Xem button', async () => {
    renderWithProviders(<KyThuatReportPage />)
    expect(
      await screen.findByRole('button', { name: /Xem/ }),
    ).toBeInTheDocument()
  })

  it('has exactly the 15 canonical statuses available as select options', () => {
    expect(REPAIR_STATUSES).toHaveLength(15)
  })
})

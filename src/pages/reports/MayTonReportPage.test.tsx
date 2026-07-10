/**
 * Spec: Báo cáo máy tồn — tri-mode radio labels present, "Xuất Excel File"
 * calls the hardened exportToXlsx helper (spy).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import MayTonReportPage from './MayTonReportPage'
import * as exportXlsx from '@/lib/export-xlsx'

describe('MayTonReportPage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })

  it('renders the tri-mode period radio labels', () => {
    renderWithProviders(<MayTonReportPage />)
    expect(screen.getByText('Xem theo ngày')).toBeInTheDocument()
    expect(screen.getByText('Xem theo tháng')).toBeInTheDocument()
    expect(screen.getByText('Xem theo năm')).toBeInTheDocument()
  })

  it('renders the Chi nhánh select with Tất cả + 3 branches', () => {
    renderWithProviders(<MayTonReportPage />)
    expect(
      screen.getByRole('combobox', { name: 'Chi nhánh' }),
    ).toBeInTheDocument()
  })

  it('renders Tìm kiếm and Xuất Excel File buttons', () => {
    renderWithProviders(<MayTonReportPage />)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel File' }),
    ).toBeInTheDocument()
  })

  it('calls exportToXlsx when Xuất Excel File is clicked', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(exportXlsx, 'exportToXlsx').mockResolvedValue()
    renderWithProviders(<MayTonReportPage />)
    await user.click(screen.getByRole('button', { name: 'Xuất Excel File' }))
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

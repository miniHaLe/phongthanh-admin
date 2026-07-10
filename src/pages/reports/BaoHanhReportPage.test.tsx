/**
 * Spec: Báo cáo SCBH Kỹ thuật — Kỹ thuật select filter present, buttons
 * "Xem Báo Cáo" + "Xuất Excel".
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import BaoHanhReportPage from './BaoHanhReportPage'

describe('BaoHanhReportPage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })

  it('renders the Kỹ thuật autocomplete filter', () => {
    renderWithProviders(<BaoHanhReportPage />)
    expect(
      screen.getByRole('combobox', { name: 'Chọn kỹ thuật…' }),
    ).toBeInTheDocument()
  })

  it('renders the Xem Báo Cáo and Xuất Excel buttons', () => {
    renderWithProviders(<BaoHanhReportPage />)
    expect(
      screen.getByRole('button', { name: 'Xem Báo Cáo' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất Excel' })).toBeInTheDocument()
  })

  it('renders the Từ ngày / Đến ngày date inputs', () => {
    renderWithProviders(<BaoHanhReportPage />)
    expect(screen.getByLabelText('Từ ngày')).toBeInTheDocument()
    expect(screen.getByLabelText('Đến ngày')).toBeInTheDocument()
  })
})

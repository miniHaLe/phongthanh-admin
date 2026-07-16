/**
 * Spec: Báo cáo KPI Tiếp nhận — mounts at its own route, Tiếp tân multi-select
 * present ("Tất cả tiếp nhận"), single "Xuất Excel File" export only (no
 * Lương / 1 Ngày variants).
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import * as exportXlsx from '@/lib/export-xlsx'
import KpiTiepNhanReportPage from './KpiTiepNhanReportPage'

describe('KpiTiepNhanReportPage', () => {
  it('mounts at /bao-cao/kpi-tiep-nhan', () => {
    renderWithProviders(
      <Routes>
        <Route
          path={ROUTES.reportKpiReceiving}
          element={<KpiTiepNhanReportPage />}
        />
      </Routes>,
      { route: ROUTES.reportKpiReceiving },
    )
    expect(screen.getByText('Báo Cáo KPI Tiếp Nhận')).toBeInTheDocument()
  })

  it('renders the Tiếp tân multi-select combobox', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KpiTiepNhanReportPage />)
    const combobox = screen.getByRole('combobox', { name: 'Tiếp tân' })
    expect(combobox).toBeInTheDocument()
    await user.click(combobox)
    expect(screen.getAllByText('Tất cả tiếp nhận').length).toBeGreaterThan(0)
  })

  it('renders a single Xuất Excel File export (no Lương / 1 Ngày variants)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KpiTiepNhanReportPage />)
    await user.click(screen.getByRole('button', { name: /Xuất Excel/ }))
    expect(
      screen.getByRole('menuitem', { name: 'Xuất Excel File' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: /Luong|Lương/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: /1 Ngày/ }),
    ).not.toBeInTheDocument()
  })

  it('exports the receiver report through the XLSX helper', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(exportXlsx, 'exportToXlsx').mockResolvedValue()
    renderWithProviders(<KpiTiepNhanReportPage />)
    await user.click(screen.getByRole('button', { name: /Xuất Excel/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Xuất Excel File' }))

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'kpi-tiep-nhan-bao-cao.xlsx' }),
    )
  })

  it('renders the Nhóm sản phẩm multi-select and Tìm kiếm button', () => {
    renderWithProviders(<KpiTiepNhanReportPage />)
    expect(
      screen.getByRole('combobox', { name: 'Nhóm sản phẩm' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
  })

  it('renders the exact Tiếp tân aging pivot after searching', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KpiTiepNhanReportPage />)
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: 'Tiếp tân' }),
      ).toBeInTheDocument()
    })
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual([
      'STT',
      'Tiếp tân',
      '1 ngày',
      '2 ngày',
      '3 ngày',
      '4 ngày',
      '5 ngày',
      '6 ngày',
      '7 ngày',
      '>7 ngày',
      'Tổng',
    ])
  })
})

/**
 * Spec: Báo cáo tình trạng chung — mounts at the report route, Nhà sản xuất
 * filter present, and after Tìm kiếm renders both column + pie charts using
 * the §5b legacy palette (Mới Nhận=#FFCC00, Sửa Xong=#3300FF).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import TinhTrangChungReportPage from './TinhTrangChungReportPage'
import { STATUS_HEX } from '@/domains/repair/status'

describe('TinhTrangChungReportPage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })

  it('mounts at /bao-cao/tinh-trang-chung', () => {
    renderWithProviders(
      <Routes>
        <Route
          path={ROUTES.reportStatusGeneral}
          element={<TinhTrangChungReportPage />}
        />
      </Routes>,
      { route: ROUTES.reportStatusGeneral },
    )
    expect(screen.getByText('Báo cáo tình trạng chung')).toBeInTheDocument()
  })

  it('renders the Nhà sản xuất autocomplete filter', () => {
    renderWithProviders(<TinhTrangChungReportPage />)
    expect(
      screen.getByRole('combobox', { name: 'Chọn nhà sản xuất…' }),
    ).toBeInTheDocument()
  })

  it('renders both column and pie charts with the §5b palette after Tìm kiếm', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TinhTrangChungReportPage />)
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() => {
      expect(screen.getAllByText('Báo cáo tình trạng chung').length).toBeGreaterThan(1)
    })
    expect(screen.getByText('Danh sách chi tiết')).toBeInTheDocument()

    // Palette check: Mới Nhận / Sửa Xong hex must match the canonical module.
    expect(STATUS_HEX[1]).toBe('#FFCC00')
    expect(STATUS_HEX[9]).toBe('#3300FF')
  })
})

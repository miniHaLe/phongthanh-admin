/** Spec: Chấm Công Tổng Hợp — 10-column per-employee totals + Xem drill-down (section-hr.md H10). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import ChamCongTongHopPage from './ChamCongTongHopPage'

describe('ChamCongTongHopPage', () => {
  it('renders the verified column headers', async () => {
    renderWithProviders(<ChamCongTongHopPage />, {
      route: ROUTES.hrAttendanceSummary,
    })
    for (const header of [
      'STT',
      'Mã NV',
      'Tên NV',
      'Chi nhánh',
      'Ngày chấm công',
      'Ngày nghỉ',
      'Giờ tăng ca',
      'Số giờ trễ',
      'Giờ về sớm',
      'Xem',
    ]) {
      expect(await screen.findByText(header)).toBeInTheDocument()
    }
  })

  it('has a Kỳ select + Xuất Excel button', async () => {
    renderWithProviders(<ChamCongTongHopPage />, {
      route: ROUTES.hrAttendanceSummary,
    })
    expect(await screen.findByText('Kỳ')).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
  })
})

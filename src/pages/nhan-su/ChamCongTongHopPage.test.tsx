/** Spec: Chấm Công Tổng Hợp — 10-column per-employee totals + Xem drill-down (section-hr.md H10). */
import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('paginates with the complete legacy page-size set', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChamCongTongHopPage />, {
      route: ROUTES.hrAttendanceSummary,
    })

    const pageSizeLabel = await screen.findByText('Hàng mỗi trang:')
    const pageSizeSelect = within(pageSizeLabel.parentElement!).getByRole(
      'combobox',
    )
    await user.click(pageSizeSelect)

    for (const option of ['20', '30', '50', '100', '150', '200', '300']) {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument()
    }
  })
})

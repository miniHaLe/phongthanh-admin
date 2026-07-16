/**
 * Spec: Báo cáo KPI Kỹ thuật — Kỹ thuật + Nhóm sản phẩm are multi-selects
 * (checkbox popover comboboxes), Nhóm options === the 13-group reference
 * list, and the 3 export buttons render inside the "Xuất Excel" menu.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import KpiReportPage from './KpiReportPage'
import { KPI_NHOM_SAN_PHAM_OPTIONS } from '@/mock/reports/kpi-mock'

const EXPECTED_NHOM_SAN_PHAM = [
  'MÁY LỌC NƯƠC RO-CÂY NÓNG LẠNH',
  'TI VI LCD',
  'ĐIỆN THOẠI',
  'ĐỒ GIA DỤNG',
  'LINH KIỆN ĐIỆN TỬ',
  'NGUYÊN VẬT LIỆU SỬA CHỬA',
  'DỤNG CỤ SỬA CHỬA',
  'MÁY LẠNH -ĐIỀU HÒA',
  'MÁY GIẶT -MÁY RỬA CHÉN -MÁY SẤY',
  'TỦ LẠNH-TỦ MÁT - TỦ ĐÔNG',
  'THIẾT BỊ ĐIỆN TỬ',
  'Thiết bị vệ sinh',
  'thiết bị thể dục thể thao',
]

describe('KpiReportPage', () => {
  it('renders Kỹ thuật and Nhóm sản phẩm as multi-select comboboxes', () => {
    renderWithProviders(<KpiReportPage />)
    expect(
      screen.getByRole('combobox', { name: 'Kỹ thuật' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Nhóm sản phẩm' }),
    ).toBeInTheDocument()
  })

  it('Nhóm sản phẩm options === the 13-group reference list, exact labels', () => {
    expect(KPI_NHOM_SAN_PHAM_OPTIONS.map((o) => o.label)).toEqual(
      EXPECTED_NHOM_SAN_PHAM,
    )
    expect(KPI_NHOM_SAN_PHAM_OPTIONS).toHaveLength(13)
  })

  it('Nhóm sản phẩm popover lists all 13 groups', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KpiReportPage />)
    await user.click(screen.getByRole('combobox', { name: 'Nhóm sản phẩm' }))
    for (const label of EXPECTED_NHOM_SAN_PHAM) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('renders the 3 KPI export buttons inside the Xuất Excel menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KpiReportPage />)
    await user.click(screen.getByRole('button', { name: /Xuất Excel/ }))
    expect(
      screen.getByRole('menuitem', { name: 'Xuất Excel File' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Xuất Excel Luong' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Xuất Excel 1 Ngày' }),
    ).toBeInTheDocument()
  })

  it('renders the Chi nhánh select + Tìm kiếm button', () => {
    renderWithProviders(<KpiReportPage />)
    expect(
      screen.getByRole('combobox', { name: 'Chi nhánh' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
  })

  it('replaces the redesigned summary with the exact technician aging pivot', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KpiReportPage />)
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: 'Kỹ thuật' }),
      ).toBeInTheDocument()
    })
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual([
      'STT',
      'Kỹ thuật',
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

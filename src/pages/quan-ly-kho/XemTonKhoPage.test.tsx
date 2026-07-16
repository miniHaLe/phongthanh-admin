/** Spec: Xem tồn kho exports the legacy data columns through the XLSX helper. */
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import * as exportXlsx from '@/lib/export-xlsx'
import XemTonKhoPage from './XemTonKhoPage'
import { NGAN_CHUA_ROWS, NHA_KHO_ROWS } from '@/mock/masterdata'

const EXPORT_HEADERS = [
  'Chi nhánh',
  'Mã hàng',
  'Tên hàng',
  'Nhóm hàng',
  'Model',
  'Giá vốn đầu kỳ',
  'Tồn đầu kỳ',
  'Nhập trong kỳ',
  'Xuất trong kỳ',
  'Tồn',
  'Giá vốn trong kỳ',
  'Tồn cuối kỳ',
  'Tổng tiền',
  'Nhà sản xuất',
  'Nhà kho',
  'Ngăn chứa',
  'Kỳ',
  'Có serial',
]

describe('XemTonKhoPage export', () => {
  it('renders the explicit legacy search affordance', () => {
    renderWithProviders(<XemTonKhoPage />)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
  })

  it('exports the exact legacy data-column order', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(exportXlsx, 'exportToXlsx').mockResolvedValue()
    renderWithProviders(<XemTonKhoPage />)

    await user.click(screen.getByRole('button', { name: 'Xuất ra Excel' }))

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    expect(spy.mock.calls[0][0].columns.map((column) => column.header)).toEqual(
      EXPORT_HEADERS,
    )
  })

  it('cascades Ngăn chứa options from the selected Nhà kho', async () => {
    const user = userEvent.setup()
    const warehouse = NHA_KHO_ROWS.find((row) =>
      NGAN_CHUA_ROWS.some((cabinet) => cabinet.nhaKhoId === row.id),
    )!
    const cabinet = NGAN_CHUA_ROWS.find(
      (row) => row.nhaKhoId === warehouse.id,
    )!
    const incompatible = NGAN_CHUA_ROWS.find(
      (row) => row.nhaKhoId !== warehouse.id,
    )!
    renderWithProviders(<XemTonKhoPage />)

    await user.click(screen.getByLabelText('Nhà kho'))
    await user.click(
      await screen.findByRole('option', { name: warehouse.tenNhaKho }),
    )
    await user.click(screen.getByLabelText('Ngăn chứa'))

    expect(screen.getByRole('option', { name: cabinet.tenNgan })).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: incompatible.tenNgan }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: cabinet.tenNgan }))

    const nextWarehouse = NHA_KHO_ROWS.find(
      (row) => row.id !== warehouse.id && NGAN_CHUA_ROWS.some((c) => c.nhaKhoId === row.id),
    )!
    await user.click(screen.getByLabelText('Nhà kho'))
    await user.click(
      screen.getByRole('option', { name: nextWarehouse.tenNhaKho }),
    )
    expect(screen.getByLabelText('Ngăn chứa')).toHaveTextContent(
      'Tất cả ngăn chứa',
    )
  })
})

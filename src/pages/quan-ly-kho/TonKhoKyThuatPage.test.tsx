/** Spec: Tồn kho kỹ thuật exports the legacy data columns through XLSX. */
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import * as exportXlsx from '@/lib/export-xlsx'
import TonKhoKyThuatPage from './TonKhoKyThuatPage'

const EXPORT_HEADERS = [
  'Chi nhánh',
  'Kỳ',
  'Kỹ thuật',
  'Mã hàng',
  'Tên hàng',
  'Nhóm hàng',
  'Nhà sản xuất',
  'Model',
  'Tồn đầu kỳ',
  'Nhập trong kỳ',
  'Xuất trong kỳ',
  'Tồn',
  'Giá vốn trong kỳ',
  'Tồn cuối kỳ',
]

describe('TonKhoKyThuatPage export', () => {
  it('renders the explicit legacy search affordance', () => {
    renderWithProviders(<TonKhoKyThuatPage />)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
  })

  it('exports the exact legacy data-column order', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(exportXlsx, 'exportToXlsx').mockResolvedValue()
    renderWithProviders(<TonKhoKyThuatPage />)

    await user.click(screen.getByRole('button', { name: 'Xuất ra Excel' }))

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    expect(spy.mock.calls[0][0].columns.map((column) => column.header)).toEqual(
      EXPORT_HEADERS,
    )
  })
})

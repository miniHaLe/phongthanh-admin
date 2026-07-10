/**
 * Spec: Chuyển Kho list — verified 10-column set (+ leading checkbox), two
 * create buttons, Trạng thái filter with the 3 verified reference options.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import ChuyenKhoPage from './ChuyenKhoPage'

const HEADERS_IN_ORDER = [
  'Trạng thái',
  'Số phiếu',
  'Ngày lập',
  'Từ chi nhánh',
  'Từ kho',
  'Đến chi nhánh',
  'Đến kho',
  'Loại',
  'Người chuyển',
  'Chọn',
]

describe('ChuyenKhoPage', () => {
  it('renders the verified column headers in order (plus leading checkbox column)', async () => {
    renderWithProviders(<ChuyenKhoPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length + 1)
    HEADERS_IN_ORDER.forEach((label, i) => {
      expect(headerCells[i + 1]).toHaveTextContent(label)
    })
  })

  it('renders the two create buttons: Chuyển cùng chi nhánh / Chuyển khác chi nhánh', () => {
    renderWithProviders(<ChuyenKhoPage />)
    expect(screen.getByRole('button', { name: 'Chuyển cùng chi nhánh' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chuyển khác chi nhánh' })).toBeInTheDocument()
  })

  it('offers the 3 verified Trạng thái filter options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChuyenKhoPage />)
    await user.click(screen.getByLabelText('Trạng thái'))
    await screen.findByRole('listbox')
    for (const label of ['Chưa xác nhận', 'Đã xác nhận', 'Không xác nhận']) {
      expect(screen.getAllByText(label)[0]).toBeInTheDocument()
    }
  })

  it('renders Tìm kiếm/Xuất Excel/Xuất Excel Chi Tiết', () => {
    renderWithProviders(<ChuyenKhoPage />)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất Excel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất Excel Chi Tiết' })).toBeInTheDocument()
  })
})

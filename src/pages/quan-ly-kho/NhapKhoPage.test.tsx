/** Spec: Nhập Kho list — verified reference columns, no Trạng thái, Tổng tiền box. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import NhapKhoPage from './NhapKhoPage'

const HEADERS_IN_ORDER = [
  'Số phiếu',
  'Số đặt hàng',
  'Số hóa đơn',
  'Nhà cung cấp',
  'Hình thức thanh toán',
  'Nhà kho',
  'Số tiền',
  'Người lập',
  'Ngày lập',
  'Ghi Chú',
  'Chọn',
]

describe('NhapKhoPage', () => {
  it('renders the verified column headers in order (plus leading checkbox column)', async () => {
    renderWithProviders(<NhapKhoPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    // First column is the "Chọn tất cả" checkbox header (no text content).
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length + 1)
    HEADERS_IN_ORDER.forEach((label, i) => {
      expect(headerCells[i + 1]).toHaveTextContent(label)
    })
  })

  it('does not render a Trạng thái column', async () => {
    renderWithProviders(<NhapKhoPage />)
    await screen.findAllByRole('columnheader')
    expect(screen.queryByRole('columnheader', { name: 'Trạng thái' })).not.toBeInTheDocument()
  })

  it('renders Thêm mới, Tải lại trang, Xuất ra Excel buttons', () => {
    renderWithProviders(<NhapKhoPage />)
    expect(screen.getByRole('button', { name: /Thêm mới/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất ra Excel' })).toBeInTheDocument()
  })

  it('renders the Tổng tiền info box', async () => {
    renderWithProviders(<NhapKhoPage />)
    expect(await screen.findByText(/Tổng tiền:/)).toBeInTheDocument()
  })
})

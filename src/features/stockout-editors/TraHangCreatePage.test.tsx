/**
 * Spec: Trả Hàng create editor — Hình thức trả option 4 === "Trả xác linh
 * kiện", toolbar labels, return grid headers.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import TraHangCreatePage from './TraHangCreatePage'

describe('TraHangCreatePage', () => {
  it('renders Lưu / Lưu & Thêm mới / In / Danh sách đơn hàng', () => {
    renderWithProviders(<TraHangCreatePage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Danh sách đơn hàng' })).toBeInTheDocument()
  })

  it('Hình thức trả option 4 is "Trả xác linh kiện" (editor-specific label)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TraHangCreatePage />)
    await user.click(screen.getByLabelText('Hình thức trả'))
    await screen.findByRole('listbox')
    const options = screen.getAllByRole('option')
    expect(options[3]).toHaveTextContent('Trả xác linh kiện')
  })

  it('renders the verified return line-grid column headers', () => {
    renderWithProviders(<TraHangCreatePage />)
    for (const label of [
      'Mã phiếu',
      'Số phiếu SC',
      'Serial',
      'Tên hàng',
      'Kho',
      'Ngăn chứa',
      'Giá',
      'Số lượng',
      'Số lượng trả',
      'Thành tiền',
    ]) {
      expect(screen.getByRole('columnheader', { name: label })).toBeInTheDocument()
    }
  })
})

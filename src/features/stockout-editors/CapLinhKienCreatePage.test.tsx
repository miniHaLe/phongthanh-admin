/**
 * Spec: Cấp Linh Kiện create editor — Lưu/Lưu & Thêm mới/Danh sách phiếu
 * toolbar, line grid headers, validation fires kỹ thuật first then sản phẩm.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import CapLinhKienCreatePage from './CapLinhKienCreatePage'

describe('CapLinhKienCreatePage', () => {
  it('renders Lưu / Lưu & Thêm mới / Danh sách phiếu', () => {
    renderWithProviders(<CapLinhKienCreatePage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Danh sách phiếu' })).toBeInTheDocument()
  })

  it('renders the verified line-grid column headers', () => {
    renderWithProviders(<CapLinhKienCreatePage />)
    for (const label of [
      'Serial',
      'Mã hàng',
      'Tên hàng',
      'Nhà sản xuất',
      'Model',
      'Giá',
      'Số lượng',
      'Thành tiền',
    ]) {
      expect(screen.getByRole('columnheader', { name: label })).toBeInTheDocument()
    }
  })

  it('validates: no kỹ thuật → "Vui lòng chọn kỹ thuật!"', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CapLinhKienCreatePage />)
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(await screen.findByText('Vui lòng chọn kỹ thuật!')).toBeInTheDocument()
  })
})

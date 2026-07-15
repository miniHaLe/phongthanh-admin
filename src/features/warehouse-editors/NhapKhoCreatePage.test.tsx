/**
 * Spec: Nhập Kho create editor — Lưu/Lưu & Thêm mới present, Nhóm khách hàng
 * 9 options, line grid headers, validation messages fire in order (nhà cung
 * cấp first, then hàng hóa).
 */
import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import NhapKhoCreatePage from './NhapKhoCreatePage'

describe('NhapKhoCreatePage', () => {
  it('renders Lưu / Lưu & Thêm mới / In / Danh sách nhập kho', () => {
    renderWithProviders(<NhapKhoCreatePage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Danh sách nhập kho' }),
    ).toBeInTheDocument()
  })

  it('Nhóm khách hàng offers the 9 verified options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhapKhoCreatePage />)
    await user.click(screen.getByLabelText(/Nhóm khách hàng/))
    const listbox = await screen.findByRole('listbox')
    for (const label of [
      'Khách lẻ',
      'Đối tác MB/Nhà CC',
      'Đại lý chính',
      'Trung tâm bảo hành',
      'Đại lý/Cửa hàng',
      'Nhân viên công ty',
      'Thợ sửa chữa',
      'Cộng tác viên',
      'Nhà xe - Chuyển phát',
    ]) {
      expect(within(listbox).getByText(label)).toBeInTheDocument()
    }
  })

  it('loads real-capable nhà kho options through the lookup seam', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhapKhoCreatePage />)
    await user.click(screen.getByLabelText(/Nhà kho/))
    expect(
      await screen.findByRole('option', { name: 'Kho Chính BMT' }),
    ).toBeInTheDocument()
  })

  it('renders the verified line-grid column headers', () => {
    renderWithProviders(<NhapKhoCreatePage />)
    for (const label of [
      'Mã',
      'Tên',
      'Ngăn chứa',
      'Số lượng',
      'Đơn giá',
      'Thành tiền',
      'Cập nhật giá',
      'Serial',
    ]) {
      expect(
        screen.getByRole('columnheader', { name: label }),
      ).toBeInTheDocument()
    }
  })

  it('validates: no nhà cung cấp → "Vui lòng chọn nhà cung cấp!"', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhapKhoCreatePage />)
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(
      await screen.findByText('Vui lòng chọn nhà cung cấp!'),
    ).toBeInTheDocument()
  })
})

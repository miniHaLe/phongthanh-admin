/** Spec: /tai-khoan shows the 8 profile labels + Chi nhánh phụ (V4: "Mở" typo fix). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import TaiKhoanPage from './TaiKhoanPage'
import { CURRENT_USER } from '@/mock/current-user-mock'

describe('TaiKhoanPage', () => {
  it('renders "Thông tin người dùng" and all 8 field labels', () => {
    renderWithProviders(<TaiKhoanPage />)
    expect(screen.getByText('Thông tin người dùng')).toBeInTheDocument()
    for (const label of [
      'Chi nhánh',
      'Tên đăng nhập',
      'Họ và tên',
      'Điện thoại',
      'Email',
      'Khóa tài khoản',
      'Quyền',
      'Chi nhánh phụ',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('renders the multi-value Chi nhánh phụ and the corrected "Mở" lock value', () => {
    renderWithProviders(<TaiKhoanPage />)
    expect(
      screen.getByText(CURRENT_USER.chiNhanhPhu.join(', ')),
    ).toBeInTheDocument()
    expect(screen.getByText('Mở')).toBeInTheDocument()
    expect(screen.queryByText('Mỡ')).not.toBeInTheDocument()
  })
})

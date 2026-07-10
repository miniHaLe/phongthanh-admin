/**
 * Spec: NhanVien full-page editor — 5 fieldset headings, Phụ cấp multi-select,
 * required-field validation, and the Lưu/Lưu & Thêm mới toolbar
 * (section-hr.md H7b, addendum page-NhanVien-Create).
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import EmployeeEditorPage from './employee-editor-page'

describe('EmployeeEditorPage — create mode', () => {
  it('renders the 5 verified fieldset headings', async () => {
    renderWithProviders(<EmployeeEditorPage />, {
      route: ROUTES.hrEmployeeCreate,
    })
    for (const heading of [
      'Thông tin cơ bản',
      'Thông tin làm việc',
      'Thông tin xác thực',
      'Thông tin ngân hàng',
      'Thông tin liên hệ',
    ]) {
      expect(
        await screen.findByRole('heading', { name: heading }),
      ).toBeInTheDocument()
    }
  })

  it('renders the Phụ cấp multi-select combobox', async () => {
    renderWithProviders(<EmployeeEditorPage />, {
      route: ROUTES.hrEmployeeCreate,
    })
    expect(
      await screen.findByRole('combobox', { name: 'Phụ cấp' }),
    ).toBeInTheDocument()
  })

  it('renders Lưu / Lưu & Thêm mới / Danh sách nhân viên', async () => {
    renderWithProviders(<EmployeeEditorPage />, {
      route: ROUTES.hrEmployeeCreate,
    })
    expect(await screen.findByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Danh sách nhân viên' }),
    ).toBeInTheDocument()
  })

  it('validates required fields on save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EmployeeEditorPage />, {
      route: ROUTES.hrEmployeeCreate,
    })
    await user.click(await screen.findByRole('button', { name: 'Lưu' }))
    expect(
      await screen.findByText('Vui lòng nhập mã nhân viên!'),
    ).toBeInTheDocument()
  })
})

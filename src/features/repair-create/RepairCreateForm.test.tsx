/**
 * Spec: legacy field labels/values, the 3 submit modes, the exact Hình thức
 * BH / Loại bảo hành radio option sets, absence of a Kỹ thuật viên input,
 * customer autocomplete placeholder, and legacy required-field messages on
 * an empty submit.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { RepairCreateForm } from './RepairCreateForm'

describe('RepairCreateForm', () => {
  it('shows the auto-generated Số phiếu placeholder', () => {
    renderWithProviders(<RepairCreateForm />)
    expect(screen.getByDisplayValue('<<Phát sinh tự động>>')).toBeInTheDocument()
  })

  it('renders exactly the 3 submit buttons', () => {
    renderWithProviders(<RepairCreateForm />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & Đóng' }),
    ).toBeInTheDocument()
  })

  it('renders the Hình thức BH radios with the exact legacy labels', () => {
    renderWithProviders(<RepairCreateForm />)
    const group = screen.getByRole('radiogroup', { name: 'Hình thức BH' })
    const labels = within_(group).map((el) => el.textContent)
    expect(labels).toEqual(['Bảo hành', 'BH sửa chửa', 'Sửa dịch vụ'])
  })

  it('renders the Loại bảo hành radios with Tại Nhà checked by default', () => {
    renderWithProviders(<RepairCreateForm />)
    const group = screen.getByRole('radiogroup', { name: 'Loại bảo hành' })
    const labels = within_(group).map((el) => el.textContent)
    expect(labels).toEqual(['Tại TTBH', 'Tại Nhà'])

    const taiNha = screen.getByRole('radio', { name: 'Tại Nhà' })
    expect(taiNha).toHaveAttribute('data-state', 'checked')
  })

  it('has no Kỹ thuật viên input', () => {
    renderWithProviders(<RepairCreateForm />)
    expect(screen.queryByText('Kỹ thuật viên')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Kỹ thuật viên/)).not.toBeInTheDocument()
  })

  it('shows the existing-customer autocomplete with the legacy placeholder', () => {
    renderWithProviders(<RepairCreateForm />)
    expect(
      screen.getByPlaceholderText('Nhập vào Tên / Số điện thoại 1-2'),
    ).toBeInTheDocument()
  })

  it('shows the legacy required-field messages on an empty submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RepairCreateForm />)

    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(
      await screen.findByText('Vui lòng chọn Model!'),
    ).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập số serial!')).toBeInTheDocument()
    expect(
      screen.getByText('Vui lòng nhập mô tả hư hỏng!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Vui lòng chọn hình thức bảo hành!'),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText('Vui lòng nhập khách hàng!').length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('Vui lòng chọn khu vực!')).toBeInTheDocument()
  })

  it('renders the image upload input and Tải tất cả hình button', () => {
    renderWithProviders(<RepairCreateForm />)
    expect(
      screen.getByLabelText('Chọn hình', { selector: 'input' }),
    ).toHaveAttribute('accept', 'image/*')
    expect(
      screen.getByRole('button', { name: 'Tải tất cả hình' }),
    ).toBeInTheDocument()
  })
})

/** Collect the text of every radio's sibling label within a radiogroup. */
function within_(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('label'))
}

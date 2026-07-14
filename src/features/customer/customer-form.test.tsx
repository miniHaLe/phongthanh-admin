import { expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import type { KhachHang } from '@/types/masterdata-types'
import { CustomerForm } from './customer-form'

const legacyCustomer: KhachHang = {
  id: 'kh-legacy',
  tenKH: 'Khách địa chỉ cũ',
  dienThoai: '0905000000',
  diaChi: '12 Trần Phú, Buôn Ma Thuột',
  loaiKhachHangId: 1,
  nguoiTao: 'admin',
  active: true,
  createdAt: '2026-07-01T00:00:00.000Z',
}

it('shows the stored legacy address and submits the explicit clear marker', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  renderWithProviders(
    <CustomerForm
      idPrefix="legacy-customer"
      initialCustomer={legacyCustomer}
      provinces={[]}
      communes={[]}
      banks={[]}
      onCancel={() => {}}
      onSubmit={onSubmit}
    />,
  )

  expect(screen.getByText(legacyCustomer.diaChi!)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Xóa địa chỉ' }))
  await user.click(screen.getByRole('button', { name: 'Lưu' }))

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ diaChi: null, clearDiaChi: true }),
  )
})

it('submits from Enter in a single-line field', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  renderWithProviders(
    <CustomerForm
      idPrefix="enter-customer"
      provinces={[]}
      communes={[]}
      banks={[]}
      onCancel={() => {}}
      onSubmit={onSubmit}
    />,
  )

  await user.type(screen.getByLabelText(/Tên khách hàng/), 'Khách Enter')
  await user.type(screen.getByLabelText(/^Điện thoại \*$/), '0905000000{enter}')

  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
})

it('keeps Enter as a newline inside the notes textarea', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  renderWithProviders(
    <CustomerForm
      idPrefix="textarea-customer"
      provinces={[]}
      communes={[]}
      banks={[]}
      onCancel={() => {}}
      onSubmit={onSubmit}
    />,
  )

  const notes = screen.getByLabelText('Ghi chú')
  await user.type(notes, 'Dòng 1{enter}Dòng 2')

  expect(notes).toHaveValue('Dòng 1\nDòng 2')
  expect(onSubmit).not.toHaveBeenCalled()
})

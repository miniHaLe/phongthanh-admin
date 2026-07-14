import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { ThemDaiLyModal } from './them-dai-ly-modal'

const persistCustomer = vi.hoisted(() => vi.fn())

vi.mock('./create-customer', () => ({ persistCustomer }))
vi.mock('./use-customer-reference-data', () => ({
  useCustomerReferenceData: () => ({
    geography: {
      version: 'test',
      effectiveFrom: '2025-07-01',
      sourceDocument: 'test',
      provinces: [],
      communes: [],
    },
    banks: [],
    loading: false,
  }),
}))

describe('ThemDaiLyModal', () => {
  beforeEach(() => persistCustomer.mockReset())

  it('shows inline phone validation and keeps the dialog open', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <ThemDaiLyModal open onClose={onClose} onCreated={() => {}} />,
    )

    await user.type(screen.getByLabelText(/Tên đại lý/), 'Đại lý Test')
    await user.type(screen.getByLabelText(/^Điện thoại \*$/), 'abc')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(
      await screen.findByText(/Số điện thoại phải gồm 10 số/),
    ).toBeInTheDocument()
    expect(persistCustomer).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('persists a restricted dealer type, invalidates the list, then closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onCreated = vi.fn()
    persistCustomer.mockResolvedValue({ id: 'kh-dealer-new' })
    const { queryClient } = renderWithProviders(
      <ThemDaiLyModal open onClose={onClose} onCreated={onCreated} />,
    )
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await user.type(screen.getByLabelText(/Tên đại lý/), 'Đại lý Test')
    await user.type(screen.getByLabelText(/^Điện thoại \*$/), '0905000000')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(persistCustomer).toHaveBeenCalledWith(
      expect.objectContaining({
        tenKH: 'Đại lý Test',
        dienThoai: '0905000000',
        loaiKhachHangId: 2,
      }),
    )
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['khach-hang'] })
    expect(onCreated).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('asks before discarding dirty input and preserves it when canceled', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <ThemDaiLyModal open onClose={onClose} onCreated={() => {}} />,
    )

    const name = screen.getByLabelText(/Tên đại lý/)
    await user.type(name, 'Đại lý chưa lưu')
    await user.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(screen.getByText('Bỏ thay đổi chưa lưu?')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }))
    expect(name).toHaveValue('Đại lý chưa lưu')

    await user.click(screen.getByRole('button', { name: 'Hủy' }))
    await user.click(screen.getByRole('button', { name: 'Bỏ thay đổi' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

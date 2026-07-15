import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { notify } from '@/components/shared'
import { khachHangConfig } from '@/config/crud-configs/khach-hang.config'
import { renderWithProviders } from '@/test/render-with-providers'
import { createCustomer } from './create-customer'
import { ThemKhachHangModal } from './them-khach-hang-modal'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('customer create sync', () => {
  it('creates through the config API instead of mutating masterdata directly', async () => {
    const created = {
      id: 'kh-real',
      tenKH: 'Khách thật',
      dienThoai: '0900000000',
      tinhId: 'tinh-1',
      loaiKhachHangId: 1,
      nguoiTao: 'Admin',
      active: true,
      createdAt: '2026-07-15T00:00:00.000Z',
    }
    const create = vi
      .spyOn(khachHangConfig.mockApi, 'create')
      .mockResolvedValue(created)

    await expect(
      createCustomer({
        tenKH: 'Khách thật',
        dienThoai: '0900000000',
        tinhId: 'tinh-1',
        loaiKhachHangId: 1,
      }),
    ).resolves.toEqual(created)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenKH: 'Khách thật',
        tinhId: 'tinh-1',
        active: true,
      }),
    )
  })

  it('requires Tỉnh with a Vietnamese validation message', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(notify, 'error').mockImplementation(() => undefined)
    const create = vi.spyOn(khachHangConfig.mockApi, 'create')
    renderWithProviders(
      <ThemKhachHangModal open onClose={vi.fn()} onCreated={vi.fn()} />,
    )

    await user.type(screen.getByLabelText(/Tên khách hàng/), 'Khách mới')
    await user.type(screen.getByLabelText('Điện thoại *'), '0900000000')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(error).toHaveBeenCalledWith('Vui lòng chọn tỉnh!')
    expect(create).not.toHaveBeenCalled()
  })

  it('submits through the real-or-mock API and closes after success', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onCreated = vi.fn()
    const created = {
      id: 'kh-browser',
      tenKH: 'Khách Browser Sync',
      dienThoai: '0900000001',
      tinhId: 'tinh-dak-lak',
      loaiKhachHangId: 1,
      nguoiTao: 'Admin',
      active: true,
      createdAt: '2026-07-15T00:00:00.000Z',
    }
    const create = vi
      .spyOn(khachHangConfig.mockApi, 'create')
      .mockResolvedValue(created)
    const success = vi
      .spyOn(notify, 'success')
      .mockImplementation(() => undefined)

    renderWithProviders(
      <ThemKhachHangModal
        open
        onClose={onClose}
        onCreated={onCreated}
      />,
    )

    expect(screen.getByRole('dialog')).toHaveClass(
      'max-h-[calc(100dvh-2rem)]',
      'overflow-y-auto',
    )
    await user.type(
      screen.getByLabelText(/Tên khách hàng/),
      'Khách Browser Sync',
    )
    await user.type(screen.getByLabelText('Điện thoại *'), '0900000001')
    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: 'ĐẮK LẮK' }))
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenKH: 'Khách Browser Sync',
          dienThoai: '0900000001',
          tinhId: 'tinh-dak-lak',
          loaiKhachHangId: 1,
        }),
      )
      expect(success).toHaveBeenCalledWith('Đã thêm khách hàng')
      expect(onCreated).toHaveBeenCalledOnce()
      expect(onClose).toHaveBeenCalledOnce()
    })
  })
})

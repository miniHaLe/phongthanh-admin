/**
 * Phase 3: the NSX quick-create dialog carries Mã / Tên / Ghi chú / Đường dẫn
 * hãng. A blank URL saves; an invalid URL blocks the save with an error.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { QuickCreateNhaSanXuat } from './quick-create-nha-san-xuat'

const mocks = vi.hoisted(() => ({ quickCreateNhaSanXuat: vi.fn() }))

vi.mock('./quick-create-lookups', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./quick-create-lookups')>()
  return { ...actual, quickCreateNhaSanXuat: mocks.quickCreateNhaSanXuat }
})

beforeEach(() => {
  mocks.quickCreateNhaSanXuat.mockReset()
})

describe('QuickCreateNhaSanXuat (product editor)', () => {
  it('renders Mã / Tên / Ghi chú / Đường dẫn hãng fields', () => {
    renderWithProviders(
      <QuickCreateNhaSanXuat close={vi.fn()} select={vi.fn()} />,
    )
    expect(screen.getByLabelText(/Tên nhà sản xuất/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã nhà sản xuất/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Đường dẫn hãng/)).toBeInTheDocument()
    expect(screen.getByLabelText('Ghi chú')).toBeInTheDocument()
  })

  it('persists the đường dẫn hãng value on save', async () => {
    const user = userEvent.setup()
    const select = vi.fn()
    mocks.quickCreateNhaSanXuat.mockResolvedValueOnce({
      id: 'nsx-new',
      tenNSX: 'Daikin',
      duongDanHang: 'https://www.daikin.com.vn',
      active: true,
      createdAt: '2026-07-11',
    })
    renderWithProviders(
      <QuickCreateNhaSanXuat close={vi.fn()} select={select} />,
    )

    await user.type(screen.getByLabelText(/Tên nhà sản xuất/), 'Daikin')
    await user.type(
      screen.getByLabelText(/Đường dẫn hãng/),
      'https://www.daikin.com.vn',
    )
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    // URL is canonicalized via new URL().toString() (adds a trailing slash).
    expect(mocks.quickCreateNhaSanXuat).toHaveBeenCalledWith(
      expect.objectContaining({
        tenNSX: 'Daikin',
        duongDanHang: 'https://www.daikin.com.vn/',
      }),
    )
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'nsx-new' }),
    )
  })

  it('blocks the save when the URL is invalid', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <QuickCreateNhaSanXuat close={vi.fn()} select={vi.fn()} />,
    )

    await user.type(screen.getByLabelText(/Tên nhà sản xuất/), 'Daikin')
    await user.type(screen.getByLabelText(/Đường dẫn hãng/), 'not a url')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(mocks.quickCreateNhaSanXuat).not.toHaveBeenCalled()
    expect(screen.getByText(/Đường dẫn không hợp lệ/)).toBeInTheDocument()
  })
})

import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import {
  HINH_THUC_FILTER_OPTIONS,
  LOAI_CHI_OPTIONS,
  LOAI_THU_OPTIONS,
} from '@/config/finance-tables/thu-chi.config'
import { LapPhieuThuModal } from './lap-phieu-thu-modal'
import { LapPhieuChiModal } from './lap-phieu-chi-modal'

const mocks = vi.hoisted(() => ({
  createPhieuThu: vi.fn(),
  createPhieuChi: vi.fn(),
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
  listCustomers: vi.fn(),
}))

vi.mock('@/mock/finance-mock', () => ({
  createPhieuThu: mocks.createPhieuThu,
  createPhieuChi: mocks.createPhieuChi,
}))

vi.mock('@/components/shared', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/components/shared')>()),
  notify: mocks.notify,
}))

vi.mock('@/features/customer/create-customer', () => ({
  listCustomers: mocks.listCustomers,
}))

beforeEach(() => {
  mocks.createPhieuThu.mockReset()
  mocks.createPhieuChi.mockReset()
  mocks.notify.success.mockReset()
  mocks.notify.error.mockReset()
  mocks.listCustomers.mockReset()
  mocks.listCustomers.mockResolvedValue({
    data: [
      {
        id: 'kh-entity-1',
        tenKH: 'Khách entity',
        dienThoai: '0901000000',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  })
})

async function chooseSelect(label: RegExp, option: string) {
  const user = userEvent.setup()
  await user.click(screen.getByLabelText(label))
  await user.click(await screen.findByRole('option', { name: option }))
}

async function fillRequiredFields(kind: 'thu' | 'chi') {
  const user = userEvent.setup()
  const typeOption = kind === 'thu' ? LOAI_THU_OPTIONS[0] : LOAI_CHI_OPTIONS[0]
  await chooseSelect(kind === 'thu' ? /Loại thu/ : /Loại chi/, typeOption.label)
  await chooseSelect(/Hình thức/, HINH_THUC_FILTER_OPTIONS[0].label)
  await user.click(screen.getByRole('checkbox', { name: /Khách lẻ/ }))
  await user.type(
    screen.getByLabelText(
      kind === 'thu' ? /Tên khách hàng/ : /Tên đối tượng chi/,
    ),
    'Khách kiểm thử',
  )
  await user.type(screen.getByLabelText(/Số tiền/), '150000')
}

describe('LapPhieuThuModal', () => {
  it('selects a shared customer option and submits the linked customer name', async () => {
    const user = userEvent.setup()
    mocks.createPhieuThu.mockResolvedValue({ soChungTu: 'PT-ENTITY' })
    renderWithProviders(
      <LapPhieuThuModal open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    )

    await chooseSelect(/Loại thu/, LOAI_THU_OPTIONS[0].label)
    await chooseSelect(/Hình thức/, HINH_THUC_FILTER_OPTIONS[0].label)
    const customerPicker = screen.getByRole('combobox', {
      name: 'Tên khách hàng',
    })
    expect(customerPicker).toHaveAttribute('id', 'lpt-khachhang')
    expect(customerPicker).toBeRequired()
    expect(
      document.querySelector('label[for="lpt-khachhang"]'),
    ).toHaveTextContent('Tên khách hàng')
    await user.click(customerPicker)
    await user.click(
      await screen.findByRole('option', {
        name: 'Khách entity — 0901000000',
      }),
    )
    await user.type(screen.getByLabelText(/Số tiền/), '150000')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() =>
      expect(mocks.createPhieuThu).toHaveBeenCalledWith(
        expect.objectContaining({ tenKhachHang: 'Khách entity' }),
      ),
    )
  })

  it('keeps a submit single-flight and shows pending feedback', async () => {
    let resolveCreate!: (voucher: { soChungTu: string }) => void
    mocks.createPhieuThu.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        }),
    )
    const onCreated = vi.fn()
    renderWithProviders(
      <LapPhieuThuModal open onOpenChange={vi.fn()} onCreated={onCreated} />,
    )
    await fillRequiredFields('thu')

    const save = screen.getByRole('button', { name: 'Lưu' })
    fireEvent.click(save)
    fireEvent.click(save)

    expect(mocks.createPhieuThu).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Đang lưu…' })).toBeDisabled()

    await act(async () => resolveCreate({ soChungTu: 'PT-001' }))
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
  })

  it('distinguishes server-unreachable failures from validation', async () => {
    mocks.createPhieuThu.mockRejectedValue(new TypeError('Failed to fetch'))
    renderWithProviders(
      <LapPhieuThuModal open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    )
    await fillRequiredFields('thu')
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(mocks.notify.error).toHaveBeenCalledWith(
        'Không thể kết nối máy chủ. Phiếu thu chưa được lưu.',
      )
    })
  })

  it('reports missing inputs without invoking the mutation', async () => {
    renderWithProviders(
      <LapPhieuThuModal open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(mocks.createPhieuThu).not.toHaveBeenCalled()
    expect(mocks.notify.error).toHaveBeenCalledWith(
      'Vui lòng nhập đầy đủ thông tin phiếu thu!',
    )
  })
})

describe('LapPhieuChiModal', () => {
  it('keeps a submit single-flight and shows pending feedback', async () => {
    let resolveCreate!: (voucher: { soChungTu: string }) => void
    mocks.createPhieuChi.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        }),
    )
    const onCreated = vi.fn()
    renderWithProviders(
      <LapPhieuChiModal open onOpenChange={vi.fn()} onCreated={onCreated} />,
    )
    await fillRequiredFields('chi')

    const save = screen.getByRole('button', { name: 'Lưu' })
    fireEvent.click(save)
    fireEvent.click(save)

    expect(mocks.createPhieuChi).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Đang lưu…' })).toBeDisabled()

    await act(async () => resolveCreate({ soChungTu: 'PC-001' }))
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
  })

  it('distinguishes server-unreachable failures from validation', async () => {
    mocks.createPhieuChi.mockRejectedValue(new TypeError('Failed to fetch'))
    renderWithProviders(
      <LapPhieuChiModal open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    )
    await fillRequiredFields('chi')
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(mocks.notify.error).toHaveBeenCalledWith(
        'Không thể kết nối máy chủ. Phiếu chi chưa được lưu.',
      )
    })
  })

  it('reports missing inputs without invoking the mutation', async () => {
    renderWithProviders(
      <LapPhieuChiModal open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(mocks.createPhieuChi).not.toHaveBeenCalled()
    expect(mocks.notify.error).toHaveBeenCalledWith(
      'Vui lòng nhập đầy đủ thông tin phiếu chi!',
    )
  })
})

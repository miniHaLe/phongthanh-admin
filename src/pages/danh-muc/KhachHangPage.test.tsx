import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { khachHangConfig } from '@/config/crud-configs/khach-hang.config'
import { useAppStore } from '@/store/app-store'
import { setAccessToken } from '@/api/auth-token'
import { RequireAuth } from '@/routes/RequireAuth'
import type { KhachHang } from '@/types/masterdata-types'
import KhachHangPage from './KhachHangPage'

vi.mock('@/features/customer/use-geography-lookup', () => ({
  useGeographyLookup: () => ({
    lookups: undefined,
    provinceOptions: [],
    isReady: true,
    isLoading: false,
  }),
}))
vi.mock('@/features/customer/them-khach-hang-modal', () => ({
  ThemKhachHangModal: () => null,
}))
vi.mock('@/features/customer/them-dai-ly-modal', () => ({
  ThemDaiLyModal: () => null,
}))
vi.mock('@/features/customer/customer-editor-dialog', () => ({
  CustomerEditorDialog: () => null,
}))
vi.mock('@/components/crud/export-crud-rows', () => ({
  exportCurrentCrudPage: vi.fn(async () => undefined),
}))

const customer: KhachHang = {
  id: 'kh-branch-1',
  branchId: 'cn-2',
  tenKH: 'Khách theo chi nhánh',
  dienThoai: '0905000000',
  diaChi: 'Gia Nghĩa, Đắk Nông',
  loaiKhachHangId: 1,
  nguoiTao: 'admin',
  active: true,
  createdAt: '2026-07-14T00:00:00.000Z',
}

describe('KhachHangPage branch scope and mobile rendering', () => {
  beforeEach(() => {
    setAccessToken(null)
    useAppStore.setState({ activeBranch: 'dak-nong' })
  })
  afterEach(() => {
    setAccessToken(null)
    vi.restoreAllMocks()
  })

  it('sends mapped branch scope, resets pagination on switch, and labels the active branch', async () => {
    const user = userEvent.setup()
    const list = vi
      .spyOn(khachHangConfig.mockApi, 'list')
      .mockImplementation(async (params) => ({
        data: [customer],
        total: 40,
        page: params.page,
        pageSize: params.pageSize,
      }))
    renderWithProviders(<KhachHangPage />)

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ branchId: 'cn-2', page: 1 }),
      ),
    )
    expect(screen.getByText('Phạm vi: Đắk Nông')).toBeInTheDocument()
    const mobileList = await screen.findByRole('region', {
      name: 'Danh sách khách hàng',
    })
    expect(within(mobileList).getByText(customer.tenKH)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Trang tiếp theo' }))
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ branchId: 'cn-2', page: 2 }),
      ),
    )

    act(() => useAppStore.getState().setActiveBranch('ctv-tuyen-huyen'))
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ branchId: 'cn-3', page: 1 }),
      ),
    )
    expect(
      screen.getByText('Phạm vi: Cộng tác viên tuyến huyện'),
    ).toBeInTheDocument()

    act(() => useAppStore.getState().setActiveBranch('dak-nong'))
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ branchId: 'cn-2', page: 1 }),
      ),
    )
  })

  it('never queries a branch persisted by a previous unauthorized session', async () => {
    setAccessToken(tokenFor({ branchIds: ['cn-1'], superScope: false }))
    const list = vi
      .spyOn(khachHangConfig.mockApi, 'list')
      .mockImplementation(async (params) => ({
        data: [customer],
        total: 1,
        page: params.page,
        pageSize: params.pageSize,
      }))

    renderWithProviders(
      <RequireAuth>
        <KhachHangPage />
      </RequireAuth>,
    )

    await waitFor(() => expect(list).toHaveBeenCalled())
    expect(useAppStore.getState().activeBranch).toBe('all')
    expect(list).toHaveBeenCalledWith(
      expect.not.objectContaining({ branchId: expect.anything() }),
    )
    expect(list).not.toHaveBeenCalledWith(
      expect.objectContaining({ branchId: 'cn-2' }),
    )
  })
})

function tokenFor(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `header.${encoded}.signature`
}

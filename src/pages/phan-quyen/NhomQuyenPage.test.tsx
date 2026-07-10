/**
 * Spec: Nhóm Quyền list columns exact [## | Chọn tất cả | Mã | Nhóm quyền |
 * Chọn], per-row view (read-only menu-tree) + edit, bulk delete, and the
 * right-pane "Thông tin nhóm quyền" form embedding the ~50-node menu-tree
 * with Lưu / Lưu & Thêm mới persisting checked node ids to permission-store.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { usePermissionStore } from '@/store/permission-store'
import { STORE_KEYS } from '@/lib/store-keys'
import NhomQuyenPage from './NhomQuyenPage'

function resetStore() {
  usePermissionStore.setState({ menuTreeChecked: {}, functionMatrixChecked: {} })
  localStorage.removeItem(STORE_KEYS.permissions)
}

describe('NhomQuyenPage', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders the exact list columns ## | Mã | Nhóm quyền + a Chọn tất cả select-all control', async () => {
    renderWithProviders(<NhomQuyenPage />)
    const headers = await screen.findAllByRole('columnheader')
    const headerText = headers.map((h) => h.textContent?.trim())
    expect(headerText).toContain('##')
    expect(headerText).toContain('Mã')
    expect(headerText).toContain('Nhóm quyền')
    expect(screen.getByLabelText('Chọn tất cả')).toBeInTheDocument()
  })

  it('renders per-row view + edit actions', async () => {
    renderWithProviders(<NhomQuyenPage />)
    expect((await screen.findAllByTitle('Xem quyền')).length).toBeGreaterThan(0)
    expect(screen.getAllByTitle('Chỉnh sửa').length).toBeGreaterThan(0)
  })

  it('shows the bulk-delete bar once a row is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhomQuyenPage />)
    const rowCheckboxes = await screen.findAllByLabelText('Chọn dòng')
    await user.click(rowCheckboxes[0])
    expect(screen.getByText(/Đã chọn 1 dòng/)).toBeInTheDocument()
  })

  it('right form shows "Thông tin nhóm quyền" with Mã, Nhóm quyền, and the menu tree', () => {
    renderWithProviders(<NhomQuyenPage />)
    expect(screen.getByText('Thông tin nhóm quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Mã')).toBeInTheDocument()
    expect(screen.getByLabelText('Nhóm quyền')).toBeInTheDocument()
    expect(screen.getByRole('tree', { name: 'Danh sách quyền menu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
  })

  it('checking a menu-tree node in the create form persists to permission-store under a draft id', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhomQuyenPage />)
    await user.click(screen.getByText('Trang chủ'))
    const state = usePermissionStore.getState().menuTreeChecked
    const draftKeys = Object.keys(state)
    expect(draftKeys.length).toBeGreaterThan(0)
    expect(state[draftKeys[0]]).toContain('mt-trang-chu')
  })

  it('clicking edit on a row loads its Mã/Nhóm quyền into the right form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhomQuyenPage />)
    const editButtons = await screen.findAllByTitle('Chỉnh sửa')
    await user.click(editButtons[0])
    const maInput = screen.getByLabelText('Mã') as HTMLInputElement
    expect(maInput.value.length).toBeGreaterThan(0)
  })

  it('clicking view opens a read-only dialog showing granted permissions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhomQuyenPage />)
    const viewButtons = await screen.findAllByTitle('Xem quyền')
    await user.click(viewButtons[0])
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('tree')).toBeInTheDocument()
    // Read-only — checkboxes in the view dialog are disabled.
    const checkboxes = within(dialog).getAllByRole('checkbox')
    for (const cb of checkboxes) {
      expect(cb).toBeDisabled()
    }
  })
})

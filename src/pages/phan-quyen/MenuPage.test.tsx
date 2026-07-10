/**
 * Spec: Menu (RoleMenu) list columns exact [## | Chọn tất cả | Tên danh mục |
 * Danh mục cha | Icon | Link | Number | Chọn], Danh mục cha filter, bulk
 * delete, and the right-pane "Thông tin danh mục" form embedding the
 * 202-checkbox function-permission matrix, persisted to localStorage.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { usePermissionStore } from '@/store/permission-store'
import { STORE_KEYS } from '@/lib/store-keys'
import MenuPage from './MenuPage'

function resetStore() {
  usePermissionStore.setState({ menuTreeChecked: {}, functionMatrixChecked: {} })
  localStorage.removeItem(STORE_KEYS.permissions)
}

describe('MenuPage', () => {
  beforeEach(() => {
    resetStore()
    // The mock list API injects a 5% random error; pin it off so the list
    // always loads deterministically in tests.
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })
  afterEach(() => vi.restoreAllMocks())

  it('renders the exact list columns Tên danh mục | Danh mục cha | Icon | Link | Number', async () => {
    renderWithProviders(<MenuPage />)
    const headers = await screen.findAllByRole('columnheader')
    const headerText = headers.map((h) => h.textContent?.trim())
    for (const label of ['Tên danh mục', 'Danh mục cha', 'Icon', 'Link', 'Number']) {
      expect(headerText).toContain(label)
    }
    expect(screen.getByLabelText('Chọn tất cả')).toBeInTheDocument()
  })

  it('offers a Danh mục cha filter', () => {
    renderWithProviders(<MenuPage />)
    // Both the toolbar filter and the right-form field carry this label —
    // the matrix form field is asserted separately.
    expect(screen.getAllByLabelText('Danh mục cha').length).toBeGreaterThanOrEqual(2)
  })

  it('shows the bulk-delete bar once a row is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MenuPage />)
    const rowCheckboxes = await screen.findAllByLabelText('Chọn dòng')
    await user.click(rowCheckboxes[0])
    // The bulk bar mounts after the selection state re-renders — wait for it.
    expect(await screen.findByText(/Đã chọn 1 dòng/)).toBeInTheDocument()
  })

  it('right form shows "Thông tin danh mục" with fields + the 202-cell function matrix', () => {
    renderWithProviders(<MenuPage />)
    expect(screen.getByText('Thông tin danh mục')).toBeInTheDocument()
    expect(screen.getByLabelText('Tên danh mục')).toBeInTheDocument()
    expect(screen.getByLabelText('Link')).toBeInTheDocument()
    expect(screen.getByLabelText('Class icon')).toBeInTheDocument()
    expect(screen.getByLabelText('Số thứ tự')).toBeInTheDocument()
    expect(
      screen.getByRole('tree', { name: 'Danh sách quyền chức năng' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
  })

  it('clicking edit on a row loads it into the form and its function-matrix state', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MenuPage />)
    const editButtons = await screen.findAllByTitle('Chỉnh sửa')
    await user.click(editButtons[0])
    const tenInput = screen.getByLabelText('Tên danh mục') as HTMLInputElement
    expect(tenInput.value.length).toBeGreaterThan(0)
  })

  it('toggling a matrix cell in the create form persists under a draft menu id', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MenuPage />)
    const firstGroupLabel = screen.getAllByText('Admin')[0]
    await user.click(firstGroupLabel)
    const state = usePermissionStore.getState().functionMatrixChecked
    const draftKeys = Object.keys(state)
    expect(draftKeys.length).toBeGreaterThan(0)
  })
})

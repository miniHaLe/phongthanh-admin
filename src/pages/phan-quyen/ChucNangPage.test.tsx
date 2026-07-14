/**
 * Spec: Chức Năng models a hierarchical entity-group → action-leaf taxonomy
 * (reconstructed from the RoleMenu function-permission tree since the
 * reference /RoleFunction/Index page is broken). Verifies the group column
 * + bulk-select/delete + save-and-new are wired through the generic
 * CrudTablePage host.
 */
import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import ChucNangPage from './ChucNangPage'

// CrudTablePage gates its list query on the route matching routePattern
// (ROUTES.permFeatures) — render at that route so data actually loads.
const route = ROUTES.permFeatures

describe('ChucNangPage', () => {
  it('renders the hierarchical Nhóm chức năng column alongside Mã/Tên chức năng', async () => {
    renderWithProviders(<ChucNangPage />, { route })
    const headers = await screen.findAllByRole('columnheader')
    const headerText = headers.map((h) => h.textContent?.trim())
    expect(headerText).toContain('Mã chức năng')
    expect(headerText).toContain('Tên chức năng')
    expect(headerText).toContain('Nhóm chức năng')

    const codeCell = await screen.findByRole('cell', { name: 'CN-G01' })
    expect(
      within(codeCell.closest('tr')!).getByText('Chi nhánh'),
    ).toBeInTheDocument()
  })

  it('supports bulk-select via the Chọn tất cả column + row checkboxes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChucNangPage />, { route })
    expect(screen.getByLabelText('Chọn tất cả')).toBeInTheDocument()
    const rowCheckboxes = await screen.findAllByLabelText('Chọn dòng')
    await user.click(rowCheckboxes[0])
    expect(screen.getByText(/Đã chọn 1 dòng/)).toBeInTheDocument()
  })

  it('offers Lưu & Thêm mới in the create sheet', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChucNangPage />, { route })
    await user.click(screen.getByRole('button', { name: 'Thêm' }))
    expect(
      screen.getByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
  })
})

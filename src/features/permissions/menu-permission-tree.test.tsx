/**
 * Spec: menu-permission-tree renders ~50 nodes mirroring the sidebar
 * hierarchy, a parent checkbox toggles all its children, and the toggled
 * state is readable straight off permission-store (proves persistence wiring,
 * not just local component state).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePermissionStore } from '@/store/permission-store'
import { MenuPermissionTree, MENU_PERMISSION_TREE } from './menu-permission-tree'

function resetStore() {
  usePermissionStore.setState({ menuTreeChecked: {}, functionMatrixChecked: {} })
}

function countNodes(): number {
  let count = 0
  for (const node of MENU_PERMISSION_TREE) {
    count += 1
    count += node.children?.length ?? 0
  }
  return count
}

describe('MenuPermissionTree', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders at least 45 checkbox tree nodes (~50 mirroring the sidebar)', () => {
    render(<MenuPermissionTree roleId="role-1" />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(45)
    expect(countNodes()).toBeGreaterThanOrEqual(45)
  })

  it('checking a parent group checks every one of its children', async () => {
    const user = userEvent.setup()
    render(<MenuPermissionTree roleId="role-1" />)

    const parent = MENU_PERMISSION_TREE.find((n) => n.id === 'mt-danh-muc')!
    const parentLabel = screen.getByText(parent.label)
    await user.click(parentLabel)

    for (const child of parent.children ?? []) {
      expect(
        usePermissionStore.getState().isMenuNodeChecked('role-1', child.id),
      ).toBe(true)
    }
    expect(
      usePermissionStore.getState().isMenuNodeChecked('role-1', parent.id),
    ).toBe(true)
  })

  it('persists the toggle in permission-store, keyed by roleId', async () => {
    const user = userEvent.setup()
    render(<MenuPermissionTree roleId="role-42" />)

    await user.click(screen.getByText('Trang chủ'))

    expect(
      usePermissionStore.getState().isMenuNodeChecked('role-42', 'mt-trang-chu'),
    ).toBe(true)
    // A different role id stays untouched.
    expect(
      usePermissionStore.getState().isMenuNodeChecked('role-1', 'mt-trang-chu'),
    ).toBe(false)
  })
})

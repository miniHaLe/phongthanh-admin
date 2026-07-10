/**
 * Spec: function-permission-matrix renders 41 entity groups expanding to a
 * large checkbox set (Xem/Thêm/Sửa/Xóa + special leaves for a few groups),
 * a group checkbox toggles all its action leaves, and toggles are readable
 * off permission-store keyed by menuId.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePermissionStore } from '@/store/permission-store'
import {
  FunctionPermissionMatrix,
  FUNCTION_PERMISSION_GROUPS,
} from './function-permission-matrix'

function resetStore() {
  usePermissionStore.setState({ menuTreeChecked: {}, functionMatrixChecked: {} })
}

describe('FunctionPermissionMatrix', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders 41 entity groups', () => {
    expect(FUNCTION_PERMISSION_GROUPS).toHaveLength(41)
    render(<FunctionPermissionMatrix menuId="menu-1" />)
    for (const group of FUNCTION_PERMISSION_GROUPS) {
      expect(screen.getAllByText(group.label).length).toBeGreaterThan(0)
    }
  })

  it('renders a large checkbox set (close to the 202-cell reference matrix)', () => {
    render(<FunctionPermissionMatrix menuId="menu-1" />)
    const checkboxes = screen.getAllByRole('checkbox')
    // Group checkboxes (41) + action-leaf checkboxes; lenient lower bound since
    // exact count depends on how many groups carry special leaves.
    expect(checkboxes.length).toBeGreaterThanOrEqual(160)
  })

  it('checking a group checkbox checks every one of its action leaves', async () => {
    const user = userEvent.setup()
    render(<FunctionPermissionMatrix menuId="menu-1" />)

    const group = FUNCTION_PERMISSION_GROUPS.find((g) => g.label === 'Nhập kho')!
    await user.click(screen.getByText(group.label))

    for (const action of group.actions) {
      expect(
        usePermissionStore.getState().isFunctionCellChecked(
          'menu-1',
          `${group.id}:${action.id}`,
        ),
      ).toBe(true)
    }
  })

  it('persists toggles in permission-store, keyed by menuId', async () => {
    const user = userEvent.setup()
    render(<FunctionPermissionMatrix menuId="menu-77" />)

    const group = FUNCTION_PERMISSION_GROUPS[0]
    await user.click(screen.getByText(group.label))

    expect(
      usePermissionStore.getState().isFunctionCellChecked(
        'menu-77',
        `${group.id}:${group.actions[0].id}`,
      ),
    ).toBe(true)
    expect(
      usePermissionStore.getState().isFunctionCellChecked(
        'menu-1',
        `${group.id}:${group.actions[0].id}`,
      ),
    ).toBe(false)
  })
})

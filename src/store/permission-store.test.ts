/**
 * Spec: permission-store persists menu-tree + function-matrix checkbox state
 * per role/menu id, and clears cleanly (mirrors the resetDemo localStorage-
 * wipe path used by every other persisted slice).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { STORE_KEYS } from '@/lib/store-keys'
import { usePermissionStore } from './permission-store'

function resetStore() {
  usePermissionStore.setState({ menuTreeChecked: {}, functionMatrixChecked: {} })
  localStorage.removeItem(STORE_KEYS.permissions)
}

describe('permission-store', () => {
  beforeEach(() => {
    resetStore()
  })

  it('toggling a menu-tree node persists it under the role id', () => {
    usePermissionStore.getState().setMenuNodes('role-1', ['mt-trang-chu'], true)
    expect(usePermissionStore.getState().isMenuNodeChecked('role-1', 'mt-trang-chu')).toBe(true)

    const persisted = JSON.parse(localStorage.getItem(STORE_KEYS.permissions) ?? '{}')
    expect(persisted.state.menuTreeChecked['role-1']).toContain('mt-trang-chu')
  })

  it('unchecking a menu-tree node removes it', () => {
    usePermissionStore.getState().setMenuNodes('role-1', ['mt-trang-chu'], true)
    usePermissionStore.getState().setMenuNodes('role-1', ['mt-trang-chu'], false)
    expect(usePermissionStore.getState().isMenuNodeChecked('role-1', 'mt-trang-chu')).toBe(false)
  })

  it('setMenuNodes batches a parent + all children in one call', () => {
    usePermissionStore.getState().setMenuNodes('role-1', ['a', 'a-1', 'a-2'], true)
    const checked = usePermissionStore.getState().menuTreeChecked['role-1']
    expect(checked).toEqual(expect.arrayContaining(['a', 'a-1', 'a-2']))
  })

  it('copyMenuChecked migrates a draft role id onto the saved id', () => {
    usePermissionStore.getState().setMenuNodes('draft', ['mt-trang-chu'], true)
    usePermissionStore.getState().copyMenuChecked('draft', 'nq-99')
    expect(usePermissionStore.getState().menuTreeChecked['draft']).toBeUndefined()
    expect(usePermissionStore.getState().isMenuNodeChecked('nq-99', 'mt-trang-chu')).toBe(true)
  })

  it('toggling a function-matrix cell persists it under the menu id', () => {
    usePermissionStore.getState().toggleFunctionCell('menu-1', 'fg-admin-0:xem')
    expect(
      usePermissionStore.getState().isFunctionCellChecked('menu-1', 'fg-admin-0:xem'),
    ).toBe(true)
    usePermissionStore.getState().toggleFunctionCell('menu-1', 'fg-admin-0:xem')
    expect(
      usePermissionStore.getState().isFunctionCellChecked('menu-1', 'fg-admin-0:xem'),
    ).toBe(false)
  })

  it('copyFunctionChecked migrates a draft menu id onto the saved id', () => {
    usePermissionStore.getState().toggleFunctionCell('draft', 'fg-admin-0:xem')
    usePermissionStore.getState().copyFunctionChecked('draft', 'menu-42')
    expect(usePermissionStore.getState().functionMatrixChecked['draft']).toBeUndefined()
    expect(
      usePermissionStore.getState().isFunctionCellChecked('menu-42', 'fg-admin-0:xem'),
    ).toBe(true)
  })

  it('clearing the persisted key resets state on next load (resetDemo path)', () => {
    usePermissionStore.getState().setMenuNodes('role-1', ['mt-trang-chu'], true)
    localStorage.removeItem(STORE_KEYS.permissions)
    resetStore()
    expect(usePermissionStore.getState().menuTreeChecked).toEqual({})
  })
})

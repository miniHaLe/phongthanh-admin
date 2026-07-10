/**
 * Permission-assignment mock store. Holds two independent checkbox-state
 * maps — one for the Nhóm Quyền menu-permission tree (keyed by role/group
 * id) and one for the Menu function-permission matrix (keyed by menu id).
 * Persisted to localStorage; pure UI mock, no runtime enforcement of access.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE_KEYS } from '@/lib/store-keys'

interface PermissionState {
  /** roleId -> checked menu-tree node ids. */
  menuTreeChecked: Record<string, string[]>
  /** menuId -> checked function-matrix cell ids. */
  functionMatrixChecked: Record<string, string[]>
}

interface PermissionActions {
  isMenuNodeChecked: (roleId: string, nodeId: string) => boolean
  /**
   * Set (or clear) a batch of menu-tree node ids for a role in one update —
   * used when toggling a parent checks/unchecks itself plus every descendant.
   */
  setMenuNodes: (roleId: string, nodeIds: string[], checked: boolean) => void
  /**
   * Move a role's checked-node set onto a different id — used to migrate a
   * create-mode draft's tree selections onto the real id once saved.
   */
  copyMenuChecked: (fromRoleId: string, toRoleId: string) => void
  isFunctionCellChecked: (menuId: string, cellId: string) => boolean
  toggleFunctionCell: (menuId: string, cellId: string) => void
  /** Move a menu's checked-cell set onto a different id (create-mode migration). */
  copyFunctionChecked: (fromMenuId: string, toMenuId: string) => void
}

export type PermissionStore = PermissionState & PermissionActions

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      menuTreeChecked: {},
      functionMatrixChecked: {},

      isMenuNodeChecked: (roleId, nodeId) =>
        (get().menuTreeChecked[roleId] ?? []).includes(nodeId),

      setMenuNodes: (roleId, nodeIds, checked) =>
        set((s) => {
          const current = new Set(s.menuTreeChecked[roleId] ?? [])
          for (const id of nodeIds) {
            if (checked) current.add(id)
            else current.delete(id)
          }
          return {
            menuTreeChecked: {
              ...s.menuTreeChecked,
              [roleId]: Array.from(current),
            },
          }
        }),

      copyMenuChecked: (fromRoleId, toRoleId) =>
        set((s) => {
          if (fromRoleId === toRoleId) return s
          const moved = s.menuTreeChecked[fromRoleId]
          if (!moved) return s
          const rest = { ...s.menuTreeChecked }
          delete rest[fromRoleId]
          return { menuTreeChecked: { ...rest, [toRoleId]: moved } }
        }),

      isFunctionCellChecked: (menuId, cellId) =>
        (get().functionMatrixChecked[menuId] ?? []).includes(cellId),

      toggleFunctionCell: (menuId, cellId) =>
        set((s) => {
          const current = new Set(s.functionMatrixChecked[menuId] ?? [])
          if (current.has(cellId)) current.delete(cellId)
          else current.add(cellId)
          return {
            functionMatrixChecked: {
              ...s.functionMatrixChecked,
              [menuId]: Array.from(current),
            },
          }
        }),

      copyFunctionChecked: (fromMenuId, toMenuId) =>
        set((s) => {
          if (fromMenuId === toMenuId) return s
          const moved = s.functionMatrixChecked[fromMenuId]
          if (!moved) return s
          const rest = { ...s.functionMatrixChecked }
          delete rest[fromMenuId]
          return { functionMatrixChecked: { ...rest, [toMenuId]: moved } }
        }),
    }),
    {
      name: STORE_KEYS.permissions,
      partialize: (s) => ({
        menuTreeChecked: s.menuTreeChecked,
        functionMatrixChecked: s.functionMatrixChecked,
      }),
    },
  ),
)

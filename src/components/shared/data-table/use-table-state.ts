import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE_KEYS } from '@/lib/store-keys'

export type Density = 'comfortable' | 'compact'

interface PerTableState {
  columnVisibility: Record<string, boolean>
  columnOrder: string[]
  density: Density
}

interface TableStateStore {
  tables: Record<string, PerTableState>
  getTable: (tableId: string) => PerTableState
  setColumnVisibility: (tableId: string, v: Record<string, boolean>) => void
  setColumnOrder: (tableId: string, order: string[]) => void
  setDensity: (tableId: string, d: Density) => void
  resetTable: (tableId: string) => void
}

const EMPTY: PerTableState = {
  columnVisibility: {},
  columnOrder: [],
  density: 'comfortable',
}

/**
 * Per-table column visibility / order / density, keyed by `tableId`.
 * Persisted (C3): the ONE table-state slice; Phase 4/5 read via this hook.
 */
export const useTableState = create<TableStateStore>()(
  persist(
    (set, get) => ({
      tables: {},
      getTable: (tableId) => get().tables[tableId] ?? EMPTY,
      setColumnVisibility: (tableId, columnVisibility) =>
        set((s) => ({
          tables: {
            ...s.tables,
            [tableId]: { ...(s.tables[tableId] ?? EMPTY), columnVisibility },
          },
        })),
      setColumnOrder: (tableId, columnOrder) =>
        set((s) => ({
          tables: {
            ...s.tables,
            [tableId]: { ...(s.tables[tableId] ?? EMPTY), columnOrder },
          },
        })),
      setDensity: (tableId, density) =>
        set((s) => ({
          tables: {
            ...s.tables,
            [tableId]: { ...(s.tables[tableId] ?? EMPTY), density },
          },
        })),
      resetTable: (tableId) =>
        set((s) => {
          const next = { ...s.tables }
          delete next[tableId]
          return { tables: next }
        }),
    }),
    { name: STORE_KEYS.tableState },
  ),
)

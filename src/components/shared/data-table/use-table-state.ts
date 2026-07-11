import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE_KEYS } from '@/lib/store-keys'

export type Density = 'comfortable' | 'compact'

export interface PerTableState {
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

export const TABLE_STATE_VERSION = 1

const REPAIR_VISIBILITY_GROUPS: Record<string, readonly string[]> = {
  status: ['tinhTrang'],
  actions: ['actions'],
  ticketRefs: ['soPhieu'],
  customer: ['khachHang'],
  product: ['sanPham'],
  assignment: ['kyThuat', 'loaiSc'],
  cost: ['chiPhi'],
  timeline: ['ngayNhan', 'ngayHt', 'suaChua'],
  notes: ['ghiChu'],
  receiver: ['nguoiNhan'],
}

const REPAIR_REPLACED_COLUMN_IDS = new Set(
  Object.entries(REPAIR_VISIBILITY_GROUPS).flatMap(([groupId, legacyIds]) =>
    legacyIds.filter((legacyId) => legacyId !== groupId),
  ),
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function migrateRepairTableState(value: unknown) {
  if (!isRecord(value)) return value

  const currentVisibility = isRecord(value.columnVisibility)
    ? value.columnVisibility
    : {}
  const columnVisibility: Record<string, boolean> = {}

  for (const [columnId, visible] of Object.entries(currentVisibility)) {
    if (
      typeof visible === 'boolean' &&
      !REPAIR_REPLACED_COLUMN_IDS.has(columnId)
    ) {
      columnVisibility[columnId] = visible
    }
  }

  for (const [groupId, legacyIds] of Object.entries(REPAIR_VISIBILITY_GROUPS)) {
    if (typeof currentVisibility[groupId] === 'boolean') continue
    if (!legacyIds.some((legacyId) => legacyId in currentVisibility)) continue

    columnVisibility[groupId] = legacyIds.every(
      (legacyId) => currentVisibility[legacyId] === false,
    )
      ? false
      : true
  }

  const columnOrder = Array.isArray(value.columnOrder)
    ? value.columnOrder.filter(
        (columnId): columnId is string =>
          typeof columnId === 'string' &&
          !REPAIR_REPLACED_COLUMN_IDS.has(columnId),
      )
    : []

  return { ...value, columnVisibility, columnOrder }
}

/** Zustand persist migration for stable table IDs and composite repair groups. */
export function migrateTableState(persistedState: unknown, version: number) {
  if (version >= TABLE_STATE_VERSION || !isRecord(persistedState)) {
    return persistedState
  }

  const tables = isRecord(persistedState.tables) ? persistedState.tables : {}
  if (!('repair-list' in tables)) return persistedState

  return {
    ...persistedState,
    tables: {
      ...tables,
      'repair-list': migrateRepairTableState(tables['repair-list']),
    },
  }
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
    {
      name: STORE_KEYS.tableState,
      version: TABLE_STATE_VERSION,
      migrate: migrateTableState,
    },
  ),
)

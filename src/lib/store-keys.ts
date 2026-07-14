/**
 * Central registry of localStorage keys used by Zustand persist slices.
 * Import from here so Phase 2+ authors never collide, and Phase 8's
 * `resetDemo()` can clear every key without drift.
 */
export const STORE_KEYS = {
  app: 'pt-app', // theme, sidebar, activeBranch (Phase 0)
  tableState: 'pt-table-state', // column visibility/order/density (Phase 1 DataTable)
  filterState: 'pt-filter-state', // active filters + saved views (Phase 1 FilterPanel)
  savedViews: 'pt-saved-views', // repair saved views (Phase 2/4)
  financeUi: 'pt-finance-ui', // finance period selection (Phase 6)
  inventoryUi: 'pt-inventory-ui', // inventory period selection (Phase 6)
  cmdRecent: 'pt-cmd-recent', // command palette recent routes (Phase 2)
  notifications: 'pt-notifications', // notification seen-ids
  permissions: 'pt-permissions', // permission-matrix checkbox state (Phase 7)
} as const

export type StoreKey = (typeof STORE_KEYS)[keyof typeof STORE_KEYS]

/** All persisted keys — used by demo-reset in Phase 8. */
export const ALL_STORE_KEYS: string[] = Object.values(STORE_KEYS)

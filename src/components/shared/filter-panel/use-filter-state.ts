import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE_KEYS } from '@/lib/store-keys'

export interface SavedView {
  id: string
  label: string
  filters: Record<string, unknown>
  createdAt: string
}

interface FilterStateStore {
  /** Named filter snapshots keyed by tableId. */
  views: Record<string, SavedView[]>
  addView: (tableId: string, view: SavedView) => void
  removeView: (tableId: string, viewId: string) => void
  getViews: (tableId: string) => SavedView[]
}

/**
 * Saved-views store (C3): the SINGLE saved-views Zustand slice. Persisted.
 * FilterPanel + SavedViews consume this; Phase 4 supplies repair field configs.
 */
export const useFilterState = create<FilterStateStore>()(
  persist(
    (set, get) => ({
      views: {},
      addView: (tableId, view) =>
        set((s) => {
          const existing = s.views[tableId] ?? []
          // overwrite same-label view, cap at 10 (drop oldest)
          const deduped = existing.filter((v) => v.label !== view.label)
          const next = [...deduped, view].slice(-10)
          return { views: { ...s.views, [tableId]: next } }
        }),
      removeView: (tableId, viewId) =>
        set((s) => ({
          views: {
            ...s.views,
            [tableId]: (s.views[tableId] ?? []).filter((v) => v.id !== viewId),
          },
        })),
      getViews: (tableId) => get().views[tableId] ?? [],
    }),
    { name: STORE_KEYS.filterState },
  ),
)

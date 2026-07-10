import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Theme preference. `system` resolves via prefers-color-scheme at apply time. */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Active branch. `all` = "Tất cả chi nhánh" (aggregate across branches).
 * Dashboard/repair queries accept all three values.
 */
export type ActiveBranch = 'dak-lak' | 'dak-nong' | 'all'

interface AppStore {
  theme: Theme
  setTheme: (t: Theme) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  activeBranch: ActiveBranch
  setActiveBranch: (b: ActiveBranch) => void
}

/**
 * Global app store. Persisted to localStorage key `pt-app`.
 * The inline script in index.html reads this same key synchronously before
 * hydration to prevent a dark-mode flash.
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      activeBranch: 'all',
      setActiveBranch: (activeBranch) => set({ activeBranch }),
    }),
    { name: 'pt-app' },
  ),
)

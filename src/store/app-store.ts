import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BRANCHES, type BranchId } from '@/mock/seed/branches'
import type { AccessTokenBranchScope } from '@/api/jwt-claims'

/** Theme preference. `system` resolves via prefers-color-scheme at apply time. */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Active branch. `all` = "Tất cả chi nhánh" (aggregate across branches).
 * Dashboard/repair queries accept the same configured UI values.
 */
export type ActiveBranch = BranchId | 'all'

export type ApiBranchId = 'cn-1' | 'cn-2' | 'cn-3'

const API_BRANCH_ID_BY_ACTIVE_BRANCH: Record<BranchId, ApiBranchId> = {
  'dak-lak': 'cn-1',
  'dak-nong': 'cn-2',
  'ctv-tuyen-huyen': 'cn-3',
}

/** Translate UI/mock branch ids to the real API's seeded branch ids. */
export function activeBranchApiId(
  activeBranch: ActiveBranch,
): ApiBranchId | undefined {
  return activeBranch === 'all'
    ? undefined
    : API_BRANCH_ID_BY_ACTIVE_BRANCH[activeBranch]
}

/** Maps API claim ids back to configured UI branch ids in display order. */
export function authorizedActiveBranches(
  apiBranchIds: readonly string[],
): BranchId[] {
  const authorizedIds = new Set(apiBranchIds)
  return BRANCHES.filter((branch) =>
    authorizedIds.has(API_BRANCH_ID_BY_ACTIVE_BRANCH[branch.id]),
  ).map((branch) => branch.id)
}

export function isActiveBranchAuthorized(
  activeBranch: ActiveBranch,
  scope: AccessTokenBranchScope,
): boolean {
  if (activeBranch === 'all' || scope.superScope) return true
  return scope.branchIds.includes(API_BRANCH_ID_BY_ACTIVE_BRANCH[activeBranch])
}

/** Prevents a persisted selection from crossing into another user's session. */
export function reconcileActiveBranch(
  activeBranch: ActiveBranch,
  scope: AccessTokenBranchScope,
): ActiveBranch {
  return isActiveBranchAuthorized(activeBranch, scope) ? activeBranch : 'all'
}

interface AppStore {
  theme: Theme
  setTheme: (t: Theme) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  activeBranch: ActiveBranch
  setActiveBranch: (b: ActiveBranch) => void
  resetActiveBranch: () => void
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
      resetActiveBranch: () => set({ activeBranch: 'all' }),
    }),
    { name: 'pt-app' },
  ),
)

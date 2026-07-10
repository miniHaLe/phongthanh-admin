import { create } from 'zustand'

/**
 * Sidebar UI state. `collapsed` (desktop icon-rail) is persisted via the main
 * app-store (`sidebarCollapsed`); `mobileOpen` (drawer) is ephemeral session
 * state, so it lives here un-persisted.
 */
interface SidebarStore {
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  mobileOpen: false,
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}))

import { useEffect } from 'react'
import { create } from 'zustand'
import type { LucideIcon } from 'lucide-react'

export interface CommandAction {
  id: string
  label: string
  group?: string // section header, e.g. "Hành động nhanh"
  icon?: LucideIcon
  keywords?: string[]
  run: () => void
}

interface CommandStore {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  /** Dynamically-registered actions keyed by owner id. */
  registered: Record<string, CommandAction[]>
  register: (ownerId: string, actions: CommandAction[]) => void
  unregister: (ownerId: string) => void
}

/**
 * Command palette store + registration API (Cross-Cutting Convention C5).
 * Phase 2 owns this. Phases 3/4/6 register their entries via
 * `useRegisterCommands(ownerId, actions)` — they never build their own palette.
 */
export const useCommandStore = create<CommandStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  registered: {},
  register: (ownerId, actions) =>
    set((s) => ({ registered: { ...s.registered, [ownerId]: actions } })),
  unregister: (ownerId) =>
    set((s) => {
      const next = { ...s.registered }
      delete next[ownerId]
      return { registered: next }
    }),
}))

/** Flattened list of all currently-registered dynamic actions. */
export function useRegisteredCommands(): CommandAction[] {
  const registered = useCommandStore((s) => s.registered)
  return Object.values(registered).flat()
}

/**
 * Register a set of command-palette actions for the lifetime of the calling
 * component. `actions` should be memoized by the caller (or stable) to avoid
 * re-registering every render.
 */
export function useRegisterCommands(ownerId: string, actions: CommandAction[]) {
  const register = useCommandStore((s) => s.register)
  const unregister = useCommandStore((s) => s.unregister)
  useEffect(() => {
    register(ownerId, actions)
    return () => unregister(ownerId)
  }, [ownerId, actions, register, unregister])
}

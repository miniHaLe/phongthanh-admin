/**
 * Notification store. The feed regenerates from deterministic repair data;
 * only the seen-id set is persisted for the notification center and bell.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE_KEYS } from '@/lib/store-keys'
import { NOTIFICATIONS, type NotificationItem } from '@/mock/notifications-mock'

interface NotificationStore {
  notifications: NotificationItem[]
  seenIds: string[]
  unseenCount: () => number
  isSeen: (id: string) => boolean
  markSeen: (id: string) => void
  markAllSeen: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: NOTIFICATIONS,
      seenIds: [],
      unseenCount: () => {
        const seen = new Set(get().seenIds)
        return get().notifications.filter((n) => !seen.has(n.id)).length
      },
      isSeen: (id) => get().seenIds.includes(id),
      markSeen: (id) =>
        set((s) =>
          s.seenIds.includes(id) ? s : { seenIds: [...s.seenIds, id] },
        ),
      markAllSeen: () =>
        set((s) => ({ seenIds: s.notifications.map((n) => n.id) })),
    }),
    {
      name: STORE_KEYS.notifications,
      // Persist only the seen-id sets — feeds regenerate deterministically.
      partialize: (s) => ({
        seenIds: s.seenIds,
      }),
    },
  ),
)

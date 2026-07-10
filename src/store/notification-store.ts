/**
 * Notification + news store. Two feeds seeded from the live repair layer; only
 * the "seen" id sets are persisted (the feeds themselves regenerate from the
 * deterministic mocks). Unseen counts drive the bell / news badges.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE_KEYS } from '@/lib/store-keys'
import { NOTIFICATIONS, type NotificationItem } from '@/mock/notifications-mock'
import { NEWS, type NewsItem } from '@/mock/news-mock'

interface NotificationStore {
  notifications: NotificationItem[]
  news: NewsItem[]
  seenIds: string[]
  seenNewsIds: string[]
  unseenCount: () => number
  unseenNewsCount: () => number
  isSeen: (id: string) => boolean
  isNewsSeen: (id: string) => boolean
  markSeen: (id: string) => void
  markAllSeen: () => void
  markNewsSeen: (id: string) => void
  markAllNewsSeen: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: NOTIFICATIONS,
      news: NEWS,
      seenIds: [],
      seenNewsIds: [],
      unseenCount: () => {
        const seen = new Set(get().seenIds)
        return get().notifications.filter((n) => !seen.has(n.id)).length
      },
      unseenNewsCount: () => {
        const seen = new Set(get().seenNewsIds)
        return get().news.filter((n) => !seen.has(n.id)).length
      },
      isSeen: (id) => get().seenIds.includes(id),
      isNewsSeen: (id) => get().seenNewsIds.includes(id),
      markSeen: (id) =>
        set((s) =>
          s.seenIds.includes(id) ? s : { seenIds: [...s.seenIds, id] },
        ),
      markAllSeen: () =>
        set((s) => ({ seenIds: s.notifications.map((n) => n.id) })),
      markNewsSeen: (id) =>
        set((s) =>
          s.seenNewsIds.includes(id)
            ? s
            : { seenNewsIds: [...s.seenNewsIds, id] },
        ),
      markAllNewsSeen: () =>
        set((s) => ({ seenNewsIds: s.news.map((n) => n.id) })),
    }),
    {
      name: STORE_KEYS.notifications,
      // Persist only the seen-id sets — feeds regenerate deterministically.
      partialize: (s) => ({
        seenIds: s.seenIds,
        seenNewsIds: s.seenNewsIds,
      }),
    },
  ),
)

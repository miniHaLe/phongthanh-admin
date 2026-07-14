/** Spec: notification store unseen counts + mark-seen actions. */
import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from './notification-store'

function reset() {
  useNotificationStore.setState({ seenIds: [] })
}

describe('notification store', () => {
  beforeEach(reset)

  it('starts with a nonzero unseen count', () => {
    expect(useNotificationStore.getState().unseenCount()).toBeGreaterThan(0)
  })

  it('markSeen decrements the unseen count', () => {
    const s = useNotificationStore.getState()
    const before = s.unseenCount()
    s.markSeen(s.notifications[0].id)
    expect(useNotificationStore.getState().unseenCount()).toBe(before - 1)
  })

  it('markAllSeen zeroes the unseen count', () => {
    useNotificationStore.getState().markAllSeen()
    expect(useNotificationStore.getState().unseenCount()).toBe(0)
  })
})

/** Spec: bell badge = store unseen count; mark-all zeroes it. */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { NotifBadge } from './NotifBadge'
import { useNotificationStore } from '@/store/notification-store'

beforeEach(() => useNotificationStore.setState({ seenIds: [] }))

describe('NotifBadge', () => {
  it('button label reflects the store unseen count', () => {
    const unseen = useNotificationStore.getState().unseenCount()
    renderWithProviders(<NotifBadge />)
    expect(
      screen.getByLabelText(`Thông báo (${unseen} mới)`),
    ).toBeInTheDocument()
  })

  it('opening the menu and marking all read zeroes the badge', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NotifBadge />)
    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByText('Đánh dấu tất cả là đã đọc'))
    expect(useNotificationStore.getState().unseenCount()).toBe(0)
    expect(screen.getByLabelText('Thông báo (0 mới)')).toBeInTheDocument()
  })
})

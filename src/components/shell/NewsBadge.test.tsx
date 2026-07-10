/** Spec: news badge = store unseen news count; footer link + mark-all. */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { NewsBadge } from './NewsBadge'
import { useNotificationStore } from '@/store/notification-store'

beforeEach(() => useNotificationStore.setState({ seenIds: [], seenNewsIds: [] }))

describe('NewsBadge', () => {
  it('button label reflects the store unseen news count', () => {
    const unseen = useNotificationStore.getState().unseenNewsCount()
    renderWithProviders(<NewsBadge />)
    expect(screen.getByLabelText(`Tin tức (${unseen} mới)`)).toBeInTheDocument()
  })

  it('marking all news read zeroes the badge', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewsBadge />)
    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByText('Đánh dấu tất cả là đã đọc'))
    expect(useNotificationStore.getState().unseenNewsCount()).toBe(0)
  })
})

/** Characterization: TopBar keeps its core widgets after the Phase 2 additions. */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { TopBar } from './TopBar'
import { useNotificationStore } from '@/store/notification-store'

beforeEach(() => useNotificationStore.setState({ seenIds: [] }))

describe('TopBar', () => {
  it('renders navigation search, one notification center, support, theme, and user menu', () => {
    renderWithProviders(<TopBar />)
    expect(screen.getByLabelText('Đi tới')).toBeInTheDocument()
    expect(screen.getByLabelText(/Thông báo/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Tin tức/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Hỗ trợ')).toBeInTheDocument()
    expect(screen.getByLabelText('Menu tài khoản')).toBeInTheDocument()
  })
})

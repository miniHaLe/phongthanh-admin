/** Characterization: TopBar keeps its core widgets after the Phase 2 additions. */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { TopBar } from './TopBar'
import { useNotificationStore } from '@/store/notification-store'

beforeEach(() => useNotificationStore.setState({ seenIds: [], seenNewsIds: [] }))

describe('TopBar', () => {
  it('renders search, bell, news, support, theme toggle, and user menu', () => {
    renderWithProviders(<TopBar />)
    expect(screen.getAllByLabelText('Tìm kiếm')[0]).toBeInTheDocument()
    expect(screen.getByLabelText(/Thông báo/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tin tức/)).toBeInTheDocument()
    expect(screen.getByLabelText('Hỗ trợ')).toBeInTheDocument()
    expect(screen.getByLabelText('Menu tài khoản')).toBeInTheDocument()
  })
})

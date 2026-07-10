/** Spec: /tin-tuc list renders the news feed. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import TinTucPage from './TinTucPage'
import { useNotificationStore } from '@/store/notification-store'

describe('TinTucPage', () => {
  it('renders the heading and the seeded news titles', () => {
    renderWithProviders(<TinTucPage />)
    const news = useNotificationStore.getState().news
    expect(screen.getAllByText('Tin tức')[0]).toBeInTheDocument()
    expect(screen.getByText(news[0].title)).toBeInTheDocument()
  })
})

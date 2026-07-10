/** Spec: /tin-tuc list renders the news feed. */
import { beforeEach, describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import TinTucPage from './TinTucPage'
import { useNotificationStore } from '@/store/notification-store'

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

describe('TinTucPage', () => {
  beforeEach(() => {
    useNotificationStore.setState({ seenNewsIds: [] })
  })

  it('renders the heading and the seeded news titles', () => {
    renderWithProviders(<TinTucPage />)
    const news = useNotificationStore.getState().news
    expect(screen.getAllByText('Tin tức')[0]).toBeInTheDocument()
    expect(screen.getByText(news[0].title)).toBeInTheDocument()
  })

  it('does not nest interactive buttons inside news rows', () => {
    const { container } = renderWithProviders(<TinTucPage />)
    expect(container.querySelector('button button')).toBeNull()
  })

  it('marks a row seen when navigating through its content link', async () => {
    const user = userEvent.setup()
    const news = useNotificationStore.getState().news
    renderWithProviders(
      <>
        <TinTucPage />
        <LocationProbe />
      </>,
      { route: '/tin-tuc' },
    )

    await user.click(screen.getByRole('link', { name: new RegExp(news[0].title) }))
    expect(useNotificationStore.getState().seenNewsIds).toContain(news[0].id)
    expect(screen.getByTestId('location')).toHaveTextContent(`/tin-tuc/${news[0].id}`)
  })

  it('mark-seen button does not navigate to the detail page', async () => {
    const user = userEvent.setup()
    const news = useNotificationStore.getState().news
    renderWithProviders(
      <>
        <TinTucPage />
        <LocationProbe />
      </>,
      { route: '/tin-tuc' },
    )

    await user.click(screen.getAllByRole('button', { name: 'Đánh dấu là đã xem' })[0])
    expect(useNotificationStore.getState().seenNewsIds).toContain(news[0].id)
    expect(screen.getByTestId('location')).toHaveTextContent('/tin-tuc')
  })
})

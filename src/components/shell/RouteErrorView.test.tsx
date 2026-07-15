import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import RouteErrorView from './RouteErrorView'

function errorRouter(error: Error) {
  return createMemoryRouter(
    [
      {
        path: '/',
        loader: () => {
          throw error
        },
        errorElement: <RouteErrorView />,
      },
    ],
    { initialEntries: ['/'] },
  )
}

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('RouteErrorView', () => {
  it('automatically reloads a chunk failure at most once per session', async () => {
    const reload = vi
      .spyOn(window.location, 'reload')
      .mockImplementation(() => {})
    const first = render(
      <RouterProvider
        router={errorRouter(
          new TypeError('Failed to fetch dynamically imported module'),
        )}
      />,
    )

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
    first.unmount()

    render(
      <RouterProvider
        router={errorRouter(
          new Error('ChunkLoadError: Loading chunk 42 failed'),
        )}
      />,
    )

    expect(
      await screen.findByText('Ứng dụng vừa được cập nhật'),
    ).toBeInTheDocument()
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('shows a friendly Vietnamese fallback without exposing the stack', async () => {
    render(
      <RouterProvider
        router={errorRouter(new Error('internal stack detail'))}
      />,
    )

    expect(
      await screen.findByText('Không thể mở trang này'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tải lại trang' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute(
      'href',
      '/trang-chu',
    )
    expect(screen.queryByText(/internal stack detail/i)).not.toBeInTheDocument()
  })
})

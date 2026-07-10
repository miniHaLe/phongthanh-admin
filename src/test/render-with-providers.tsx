/**
 * Shared test render helper — wraps UI in the providers the app relies on:
 * a fresh React Query client (retry off, no caching between tests) and a
 * MemoryRouter so route-aware components render without a real browser history.
 */
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial URL for the MemoryRouter (default '/'). */
  route?: string
}

/** Build a QueryClient with test-friendly defaults (no retries, no cache reuse). */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: RenderWithProvidersOptions = {},
) {
  const queryClient = makeTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}

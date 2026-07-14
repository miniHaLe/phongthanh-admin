import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { setAccessToken } from '@/api/auth-token'
import { ROUTES } from '@/constants/routes'
import { useAppStore } from '@/store/app-store'
import { RequireAuth } from './RequireAuth'

function tokenFor(
  mustChangePassword: boolean,
  branchIds: string[] = [],
  superScope = false,
): string {
  const payload = btoa(
    JSON.stringify({ mustChangePassword, branchIds, superScope }),
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `header.${payload}.signature`
}

function renderRoutes(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path={ROUTES.changePassword}
          element={
            <RequireAuth>
              <div>Màn hình đổi mật khẩu</div>
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth>
              <div>Nội dung bảo vệ</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  setAccessToken(null)
  useAppStore.setState({ activeBranch: 'all' })
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('RequireAuth', () => {
  it('redirects flagged users to change password without looping there', async () => {
    setAccessToken(tokenFor(true))
    renderRoutes(ROUTES.home)

    expect(await screen.findByText('Màn hình đổi mật khẩu')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung bảo vệ')).not.toBeInTheDocument()
  })

  it('allows protected content for an unflagged access token', () => {
    setAccessToken(tokenFor(false))
    renderRoutes(ROUTES.home)

    expect(screen.getByText('Nội dung bảo vệ')).toBeInTheDocument()
  })

  it('coalesces concurrent boot refreshes', async () => {
    const freshToken = tokenFor(false)
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ accessToken: freshToken }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubEnv('VITE_API_URL', 'https://api.example.test')
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <RequireAuth>
          <div>Khối bảo vệ A</div>
        </RequireAuth>
        <RequireAuth>
          <div>Khối bảo vệ B</div>
        </RequireAuth>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Khối bảo vệ A')).toBeInTheDocument()
    expect(await screen.findByText('Khối bảo vệ B')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.example.test/auth/refresh',
    )
  })

  it('withholds protected children until a persisted branch matches the new JWT', async () => {
    useAppStore.setState({ activeBranch: 'dak-nong' })
    setAccessToken(tokenFor(false, ['cn-1']))
    const renderedBranches: string[] = []

    function ProtectedContent() {
      renderedBranches.push(useAppStore.getState().activeBranch)
      return <div>Nội dung đúng phạm vi</div>
    }

    render(
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <RequireAuth>
          <ProtectedContent />
        </RequireAuth>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nội dung đúng phạm vi')).toBeInTheDocument()
    expect(useAppStore.getState().activeBranch).toBe('all')
    expect(renderedBranches).toEqual(['all'])
  })
})

/** Characterization + spec: UserMenu items incl. "Thông tin tài khoản". */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { UserMenu } from './UserMenu'
import { useAppStore } from '@/store/app-store'

const { logoutMock } = vi.hoisted(() => ({
  logoutMock: vi.fn(async () => undefined),
}))

vi.mock('@/api/auth-client', () => ({ logout: logoutMock }))

async function openMenu() {
  const user = userEvent.setup()
  renderWithProviders(<UserMenu />)
  await user.click(screen.getByLabelText('Menu tài khoản'))
  return user
}

describe('UserMenu', () => {
  beforeEach(() => {
    logoutMock.mockClear()
    useAppStore.setState({ activeBranch: 'all' })
  })

  it('contains Đổi mật khẩu and Đăng xuất (characterization)', async () => {
    await openMenu()
    expect(await screen.findByText('Đổi mật khẩu')).toBeInTheDocument()
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
  })

  it('adds a "Thông tin tài khoản" item', async () => {
    await openMenu()
    expect(await screen.findByText('Thông tin tài khoản')).toBeInTheDocument()
  })

  it('resets the persisted branch when logging out', async () => {
    useAppStore.setState({ activeBranch: 'dak-nong' })
    const user = await openMenu()

    await user.click(screen.getByText('Đăng xuất'))

    await waitFor(() => expect(logoutMock).toHaveBeenCalledTimes(1))
    expect(useAppStore.getState().activeBranch).toBe('all')
  })
})

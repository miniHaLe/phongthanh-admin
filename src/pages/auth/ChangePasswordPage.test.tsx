import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/constants/routes'
import ChangePasswordPage from './ChangePasswordPage'

const mocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  refreshAccessToken: vi.fn(),
  coalescedRefresh: vi.fn(),
  successToast: vi.fn(),
  errorToast: vi.fn(),
}))

vi.mock('@/api/auth-client', () => ({
  changePassword: mocks.changePassword,
  refreshAccessToken: mocks.refreshAccessToken,
}))

vi.mock('@/api/auth-token', () => ({
  coalescedRefresh: mocks.coalescedRefresh,
}))

vi.mock('sonner', () => ({
  toast: {
    success: mocks.successToast,
    error: mocks.errorToast,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ChangePasswordPage', () => {
  it('waits for a fresh access token before navigating home', async () => {
    const user = userEvent.setup()
    let resolveRefresh: ((token: string | null) => void) | undefined
    mocks.changePassword.mockResolvedValue(undefined)
    mocks.refreshAccessToken.mockImplementation(
      () =>
        new Promise<string | null>((resolve) => {
          resolveRefresh = resolve
        }),
    )
    mocks.coalescedRefresh.mockImplementation(
      (refresh: () => Promise<string | null>) => refresh(),
    )

    render(
      <MemoryRouter initialEntries={[ROUTES.changePassword]}>
        <Routes>
          <Route
            path={ROUTES.changePassword}
            element={<ChangePasswordPage />}
          />
          <Route path={ROUTES.home} element={<div>Trang chủ</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Mật khẩu cũ'), 'OldPassword1')
    await user.type(screen.getByLabelText('Mật khẩu mới'), 'NewPassword1')
    await user.type(
      screen.getByLabelText('Nhập lại mật khẩu'),
      'NewPassword1',
    )
    await user.click(screen.getByRole('button', { name: 'Lưu mật khẩu' }))

    await waitFor(() => expect(mocks.changePassword).toHaveBeenCalledTimes(1))
    expect(mocks.coalescedRefresh).toHaveBeenCalledWith(
      mocks.refreshAccessToken,
    )
    expect(screen.queryByText('Trang chủ')).not.toBeInTheDocument()

    await act(async () => resolveRefresh?.('fresh-access-token'))

    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
    expect(mocks.successToast).toHaveBeenCalledWith('Đổi mật khẩu thành công')
  })
})

/** Characterization + spec: UserMenu items incl. "Thông tin tài khoản". */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { UserMenu } from './UserMenu'

async function openMenu() {
  const user = userEvent.setup()
  renderWithProviders(<UserMenu />)
  await user.click(screen.getByLabelText('Menu tài khoản'))
  return user
}

describe('UserMenu', () => {
  it('contains Đổi mật khẩu and Đăng xuất (characterization)', async () => {
    await openMenu()
    expect(await screen.findByText('Đổi mật khẩu')).toBeInTheDocument()
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
  })

  it('adds a "Thông tin tài khoản" item', async () => {
    await openMenu()
    expect(
      await screen.findByText('Thông tin tài khoản'),
    ).toBeInTheDocument()
  })
})

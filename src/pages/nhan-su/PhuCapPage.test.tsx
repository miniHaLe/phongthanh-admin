/** Spec: Phụ Cấp page — verified columns + create sheet with Loại radio (section-hr.md H2). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import PhuCapPage from './PhuCapPage'

describe('PhuCapPage', () => {
  it('renders the verified column headers', async () => {
    renderWithProviders(<PhuCapPage />, { route: ROUTES.hrAllowances })
    expect(await screen.findByText('Tên phụ cấp')).toBeInTheDocument()
    expect(await screen.findByText('Loại phụ cấp')).toBeInTheDocument()
    expect(await screen.findByText('GiaTri')).toBeInTheDocument()
  })

  it('opens the create sheet with the Loại radio (Ăn Chia / Tiền mặt)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PhuCapPage />, { route: ROUTES.hrAllowances })
    await user.click(await screen.findByRole('button', { name: /Thêm/ }))
    expect(await screen.findByText('Ăn Chia')).toBeInTheDocument()
    expect(await screen.findByText('Tiền mặt')).toBeInTheDocument()
  })
})

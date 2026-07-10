/** Spec: Loại Phạt Thưởng page — verified columns + Loại radio (Thưởng/Phạt) (section-hr.md H3). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import LoaiPhatThuongPage from './LoaiPhatThuongPage'

describe('LoaiPhatThuongPage', () => {
  it('renders the verified column headers', async () => {
    renderWithProviders(<LoaiPhatThuongPage />, { route: ROUTES.hrBonusTypes })
    expect(await screen.findByText('Loại')).toBeInTheDocument()
    expect(await screen.findByText('Tên Loại')).toBeInTheDocument()
  })

  it('opens the create sheet with the Loại radio (Thưởng / Phạt)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoaiPhatThuongPage />, { route: ROUTES.hrBonusTypes })
    await user.click(await screen.findByRole('button', { name: /Thêm/ }))
    expect(await screen.findByText('Thưởng')).toBeInTheDocument()
    expect(await screen.findByText('Phạt')).toBeInTheDocument()
  })
})

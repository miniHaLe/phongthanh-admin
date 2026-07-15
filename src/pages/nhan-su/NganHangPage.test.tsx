/** Spec: Ngân Hàng page — renders via CrudTablePage with the verified columns (section-hr.md H1). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import NganHangPage from './NganHangPage'

describe('NganHangPage', () => {
  it('renders the verified column headers + Thêm button', async () => {
    renderWithProviders(<NganHangPage />, { route: ROUTES.catalogBanks })
    expect(await screen.findByText('Mã Ngân Hàng')).toBeInTheDocument()
    expect(await screen.findByText('Tên Ngân Hàng')).toBeInTheDocument()
    expect(await screen.findByText('Địa chỉ')).toBeInTheDocument()
    expect(await screen.findByText('Vietcombank')).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /Thêm/ }),
    ).toBeInTheDocument()
  })
})

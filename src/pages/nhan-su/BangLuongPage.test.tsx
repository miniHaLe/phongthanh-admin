/**
 * Spec: Bảng lương — 17-column table (16 headers + Chọn), totals row, and the
 * empty-record "Tạo bảng lương" CTA (section-hr.md H8, addendum verified).
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import { BANG_LUONG_COLUMNS } from '@/domains/hr/bang-luong-columns'
import BangLuongPage from './BangLuongPage'

describe('BangLuongPage', () => {
  it('renders the 16 verified column headers', async () => {
    renderWithProviders(<BangLuongPage />, { route: ROUTES.hrPayroll })
    for (const header of BANG_LUONG_COLUMNS) {
      expect(await screen.findAllByText(header)).not.toHaveLength(0)
    }
  })

  it('shows a Tổng lương aggregate and Tạo bảng lương CTA for un-created rows', async () => {
    renderWithProviders(<BangLuongPage />, { route: ROUTES.hrPayroll })
    expect(await screen.findByText(/Tổng lương:/)).toBeInTheDocument()
    // At least one employee×kỳ combination has no seeded record (70% seed
    // rate), so the CTA should render.
    expect(
      (await screen.findAllByRole('button', { name: 'Tạo bảng lương' })).length,
    ).toBeGreaterThan(0)
  })
})

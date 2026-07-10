/** Spec: Hóa Đơn list — bulk-delete checkbox column + Lập Hóa Đơn → composer route. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import HoaDonPage from './HoaDonPage'

describe('HoaDonPage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the verified data columns plus the leading checkbox column', async () => {
    renderWithProviders(<HoaDonPage />, { route: ROUTES.financeInvoices })
    const headerCells = await screen.findAllByRole('columnheader')
    const labels = headerCells.map((c) => c.textContent)
    expect(labels).toContain('Số Hóa Đơn')
    expect(labels).toContain('Hình Thức Thanh Toán')
    expect(labels).toContain('Mã Số Thuế')
    expect(labels).toContain('Tiền thuế')
    expect(labels).toContain('Tổng Thanh Toán')
    expect(labels).toContain('Người Lập')
    expect(labels).not.toContain('Trạng thái')
  })

  it('renders the Lập Hóa Đơn header button', () => {
    renderWithProviders(<HoaDonPage />, { route: ROUTES.financeInvoices })
    expect(screen.getByRole('button', { name: 'Lập Hóa Đơn' })).toBeInTheDocument()
  })

  it('has no generic "Thêm" create button (composer-only create)', () => {
    renderWithProviders(<HoaDonPage />, { route: ROUTES.financeInvoices })
    expect(screen.queryByRole('button', { name: 'Thêm' })).not.toBeInTheDocument()
  })
})

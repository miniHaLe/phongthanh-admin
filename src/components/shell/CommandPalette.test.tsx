import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { CommandPalette } from './CommandPalette'
import {
  filterPaletteDynamicActions,
  getPaletteNavigationItems,
} from './navigation-command-utils'
import { useCommandStore } from './command-registry'
import { ROUTES } from '@/constants/routes'

beforeEach(() => {
  useCommandStore.setState({ open: true, registered: {} })
})

describe('CommandPalette', () => {
  it('uses the navigation label and indexes operational children', () => {
    renderWithProviders(<CommandPalette />)
    expect(screen.getByPlaceholderText('Đi tới…')).toBeInTheDocument()
    expect(screen.getByText('Mở Tồn kho')).toBeInTheDocument()
    expect(screen.getByText('Mở Bán hàng')).toBeInTheDocument()
    expect(screen.getByText('Mở Doanh thu')).toBeInTheDocument()
  })

  it('DEV-gates Gallery and removes duplicate page-local navigation actions', () => {
    expect(
      getPaletteNavigationItems(false).some(
        (item) => item.path === ROUTES.gallery,
      ),
    ).toBe(false)
    expect(
      getPaletteNavigationItems(true).some(
        (item) => item.path === ROUTES.gallery,
      ),
    ).toBe(true)

    const run = vi.fn()
    expect(
      filterPaletteDynamicActions([
        { id: 'nav-ban-hang', label: 'Mở Bán hàng', run },
        { id: 'dashboard-home', label: 'Trang chủ', group: 'Điều hướng', run },
        { id: 'quick-create', label: 'Lập phiếu mới', run },
      ]).map((item) => item.id),
    ).toEqual(['quick-create'])
  })
})

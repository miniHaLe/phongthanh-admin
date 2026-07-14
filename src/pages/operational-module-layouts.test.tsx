import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'
import QuanLyKhoPage from '@/pages/quan-ly-kho/QuanLyKhoPage'
import XuatKhoPage from '@/pages/xuat-kho/XuatKhoPage'
import TaiChinhPage from '@/pages/tai-chinh/TaiChinhPage'
import BaoCaoPage from '@/pages/reports/BaoCaoPage'

function PathProbe() {
  return <span data-testid="path">{useLocation().pathname}</span>
}

const cases = [
  ['inventory', ROUTES.inventory, QuanLyKhoPage, 'Quản lý kho con'],
  ['stock-out', ROUTES.stockOut, XuatKhoPage, 'Xuất kho con'],
  ['finance', ROUTES.finance, TaiChinhPage, 'Tài chính con'],
  ['reports', ROUTES.reports, BaoCaoPage, 'Báo cáo con'],
] as const

describe('operational module layouts', () => {
  it.each(cases)(
    'click-reaches every %s child',
    async (id, root, Page, label) => {
      const user = userEvent.setup()
      const children = NAV_ITEMS.find((item) => item.id === id)?.children ?? []
      render(
        <MemoryRouter initialEntries={[root]}>
          <Routes>
            <Route path={`${root}/*`} element={<Page />}>
              <Route path="*" element={<PathProbe />} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(
        await screen.findByRole('tablist', { name: label }),
      ).toBeInTheDocument()
      for (const child of children) {
        await user.click(screen.getByRole('tab', { name: child.label }))
        await waitFor(() =>
          expect(screen.getByTestId('path')).toHaveTextContent(child.path),
        )
      }
    },
  )
})

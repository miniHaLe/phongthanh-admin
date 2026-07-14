import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'
import DanhMucPage from '@/pages/danh-muc/DanhMucPage'
import NhanSuPage from '@/pages/nhan-su/NhanSuPage'
import PhanQuyenPage from '@/pages/phan-quyen/PhanQuyenPage'
import QuanLyPage from '@/pages/quan-ly/QuanLyPage'
import { ModuleTabStrip, type ModuleTab } from './module-tab-strip'

function PathProbe() {
  const { pathname } = useLocation()
  return <div data-testid="pathname">{pathname}</div>
}

describe('ModuleTabStrip', () => {
  it('matches active tabs on path-segment boundaries', () => {
    const tabs: ModuleTab[] = [
      { label: 'Chấm công', path: ROUTES.hrAttendance },
      { label: 'Chấm công tổng hợp', path: ROUTES.hrAttendanceSummary },
    ]

    render(
      <MemoryRouter initialEntries={[ROUTES.hrAttendanceSummary]}>
        <ModuleTabStrip tabs={tabs} ariaLabel="Nhân sự con" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: 'Chấm công' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(
      screen.getByRole('tab', { name: 'Chấm công tổng hợp' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen
        .getAllByRole('tab')
        .filter((tab) => tab.getAttribute('aria-selected') === 'true'),
    ).toHaveLength(1)
  })

  it('keeps overflow controls visible for long tab sets', () => {
    const tabs = Array.from({ length: 7 }, (_, index) => ({
      label: `Mục ${index + 1}`,
      path: `/module/${index + 1}`,
    }))

    render(
      <MemoryRouter initialEntries={['/module/1']}>
        <ModuleTabStrip tabs={tabs} ariaLabel="Danh mục con" />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('tablist', { name: 'Danh mục con' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cuộn danh mục con sang trái' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cuộn danh mục con sang phải' }),
    ).toBeInTheDocument()
  })

  it('supports arrow, Home, and End keyboard focus movement', () => {
    const tabs: ModuleTab[] = [
      { label: 'Một', path: '/module/one' },
      { label: 'Hai', path: '/module/two' },
      { label: 'Ba', path: '/module/three' },
    ]

    render(
      <MemoryRouter initialEntries={['/module/one']}>
        <ModuleTabStrip tabs={tabs} ariaLabel="Module con" />
      </MemoryRouter>,
    )

    const first = screen.getByRole('tab', { name: 'Một' })
    const second = screen.getByRole('tab', { name: 'Hai' })
    const last = screen.getByRole('tab', { name: 'Ba' })
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(second).toHaveFocus()
    fireEvent.keyDown(second, { key: 'End' })
    expect(last).toHaveFocus()
    fireEvent.keyDown(last, { key: 'Home' })
    expect(first).toHaveFocus()
  })
})

const layoutCases = [
  {
    name: 'Danh Mục',
    Page: DanhMucPage,
    root: ROUTES.catalog,
    target: ROUTES.catalogModel,
    navId: 'catalog',
    ariaLabel: 'Danh mục con',
  },
  {
    name: 'Nhân Sự',
    Page: NhanSuPage,
    root: ROUTES.hr,
    target: ROUTES.hrEmployees,
    navId: 'hr',
    ariaLabel: 'Nhân sự con',
  },
  {
    name: 'Quản Lý',
    Page: QuanLyPage,
    root: ROUTES.manage,
    target: ROUTES.manageBranches,
    navId: 'manage',
    ariaLabel: 'Quản lý con',
  },
  {
    name: 'Phân Quyền',
    Page: PhanQuyenPage,
    root: ROUTES.permissions,
    target: ROUTES.permGroups,
    navId: 'permissions',
    ariaLabel: 'Phân quyền con',
  },
] as const

describe('admin module layouts', () => {
  it.each(layoutCases)(
    'keeps $name labels, order, and root redirect',
    async ({ Page, root, target, navId, ariaLabel }) => {
      render(
        <MemoryRouter initialEntries={[root]}>
          <Routes>
            <Route path={`${root}/*`} element={<Page />}>
              <Route path="*" element={<PathProbe />} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      await waitFor(() =>
        expect(screen.getByTestId('pathname')).toHaveTextContent(target),
      )
      const expectedLabels =
        NAV_ITEMS.find((item) => item.id === navId)?.children?.map(
          (child) => child.label,
        ) ?? []
      expect(
        screen.getAllByRole('tab').map((tab) => tab.textContent?.trim()),
      ).toEqual(expectedLabels)
      expect(
        screen.getByRole('tablist', { name: ariaLabel }),
      ).toBeInTheDocument()
    },
  )
})

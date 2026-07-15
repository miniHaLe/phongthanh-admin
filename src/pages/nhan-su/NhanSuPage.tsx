/**
 * Nhân Sự section layout — sticky sub-nav tab strip + <Outlet/>.
 * Default route redirects to NhanVien.
 */
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const HR_NAV = NAV_ITEMS.find((n) => n.id === 'hr')?.children ?? []

export default function NhanSuPage() {
  const { pathname } = useLocation()
  const isRoot = pathname === ROUTES.hr || pathname === ROUTES.hr + '/'
  if (isRoot) return <Navigate to={ROUTES.hrEmployees} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={HR_NAV} ariaLabel="Nhân sự con" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

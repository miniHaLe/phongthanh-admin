/**
 * Quản Lý section layout — sticky sub-nav tab strip + <Outlet/>.
 * Default route redirects to Chi Nhánh.
 */
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const MANAGE_NAV = NAV_ITEMS.find((n) => n.id === 'manage')?.children ?? []

export default function QuanLyPage() {
  const { pathname } = useLocation()
  const isRoot = pathname === ROUTES.manage || pathname === ROUTES.manage + '/'
  if (isRoot) return <Navigate to={ROUTES.manageBranches} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={MANAGE_NAV} ariaLabel="Quản lý con" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

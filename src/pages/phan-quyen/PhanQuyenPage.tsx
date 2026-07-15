/**
 * Phân Quyền section layout — sticky sub-nav tab strip + <Outlet/>.
 * Default route redirects to NhomQuyen.
 */
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const PERM_NAV = NAV_ITEMS.find((n) => n.id === 'permissions')?.children ?? []

export default function PhanQuyenPage() {
  const { pathname } = useLocation()
  const isRoot =
    pathname === ROUTES.permissions || pathname === ROUTES.permissions + '/'
  if (isRoot) return <Navigate to={ROUTES.permGroups} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={PERM_NAV} ariaLabel="Phân quyền con" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

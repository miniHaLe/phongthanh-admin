/**
 * Danh Mục section layout — sticky sub-nav tab strip + <Outlet/>.
 * Default route redirects to KhachHang (first child).
 */
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const CATALOG_NAV = NAV_ITEMS.find((n) => n.id === 'catalog')?.children ?? []

export default function DanhMucPage() {
  const { pathname } = useLocation()
  const isRoot =
    pathname === ROUTES.catalog || pathname === ROUTES.catalog + '/'

  // Redirect bare /danh-muc to first child
  if (isRoot) return <Navigate to={ROUTES.catalogModel} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={CATALOG_NAV} ariaLabel="Danh mục con" />

      {/* Child page content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

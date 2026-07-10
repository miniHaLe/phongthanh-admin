/**
 * Danh Mục section layout — sticky sub-nav tab strip + <Outlet/>.
 * Default route redirects to KhachHang (first child).
 */
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const CATALOG_NAV = NAV_ITEMS.find((n) => n.id === 'catalog')?.children ?? []

export default function DanhMucPage() {
  const { pathname } = useLocation()
  const isRoot =
    pathname === ROUTES.catalog || pathname === ROUTES.catalog + '/'

  // Redirect bare /danh-muc to first child
  if (isRoot) return <Navigate to={ROUTES.catalogModel} replace />

  return (
    <div className="flex h-full flex-col">
      {/* Horizontally scrollable tab strip */}
      <nav
        className="shrink-0 overflow-x-auto border-b border-border bg-background/80 backdrop-blur"
        aria-label="Danh mục con"
      >
        <div className="flex min-w-max gap-0.5 px-4 pt-2">
          {CATALOG_NAV.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-t-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Child page content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

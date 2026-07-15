import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const INVENTORY_NAV =
  NAV_ITEMS.find((item) => item.id === 'inventory')?.children ?? []

export default function QuanLyKhoPage() {
  const { pathname } = useLocation()
  const isRoot =
    pathname === ROUTES.inventory || pathname === `${ROUTES.inventory}/`

  if (isRoot) return <Navigate to={ROUTES.inventoryStockView} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={INVENTORY_NAV} ariaLabel="Quản lý kho con" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

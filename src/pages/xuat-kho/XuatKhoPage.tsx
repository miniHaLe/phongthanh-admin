import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const STOCK_OUT_NAV =
  NAV_ITEMS.find((item) => item.id === 'stock-out')?.children ?? []

export default function XuatKhoPage() {
  const { pathname } = useLocation()
  const isRoot =
    pathname === ROUTES.stockOut || pathname === `${ROUTES.stockOut}/`

  if (isRoot) return <Navigate to={ROUTES.stockOutPartsDispatch} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={STOCK_OUT_NAV} ariaLabel="Xuất kho con" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const FINANCE_NAV =
  NAV_ITEMS.find((item) => item.id === 'finance')?.children ?? []

export default function TaiChinhPage() {
  const { pathname } = useLocation()
  const isRoot =
    pathname === ROUTES.finance || pathname === `${ROUTES.finance}/`

  if (isRoot) return <Navigate to={ROUTES.financeTransactions} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={FINANCE_NAV} ariaLabel="Tài chính con" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

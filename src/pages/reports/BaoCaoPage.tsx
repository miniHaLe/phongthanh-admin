import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ModuleTabStrip } from '@/components/shell/module-tab-strip'
import { NAV_ITEMS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'

const REPORT_NAV =
  NAV_ITEMS.find((item) => item.id === 'reports')?.children ?? []

export default function BaoCaoPage() {
  const { pathname } = useLocation()
  const isRoot =
    pathname === ROUTES.reports || pathname === `${ROUTES.reports}/`

  if (isRoot) return <Navigate to={ROUTES.reportKpi} replace />

  return (
    <div className="flex h-full flex-col">
      <ModuleTabStrip tabs={REPORT_NAV} ariaLabel="Báo cáo con" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

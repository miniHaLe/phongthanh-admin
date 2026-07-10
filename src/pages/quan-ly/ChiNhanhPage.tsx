import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { chiNhanhConfig } from '@/config/crud-configs/chi-nhanh.config'
import { ROUTES } from '@/constants/routes'

export default function ChiNhanhPage() {
  return (
    <CrudTablePage
      config={chiNhanhConfig}
      routePattern={ROUTES.manageBranches}
    />
  )
}

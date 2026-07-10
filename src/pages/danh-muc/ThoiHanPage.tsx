import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { thoiHanConfig } from '@/config/crud-configs/thoi-han.config'
import { ROUTES } from '@/constants/routes'

export default function ThoiHanPage() {
  return (
    <CrudTablePage
      config={thoiHanConfig}
      routePattern={ROUTES.catalogWarrantyPeriod}
    />
  )
}

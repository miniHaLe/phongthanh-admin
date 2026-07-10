import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { phiGiaoConfig } from '@/config/crud-configs/phi-giao.config'
import { ROUTES } from '@/constants/routes'

export default function PhiGiaoPage() {
  return (
    <CrudTablePage
      config={phiGiaoConfig}
      routePattern={ROUTES.catalogDeliveryFee}
    />
  )
}

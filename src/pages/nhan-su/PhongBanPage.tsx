import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { phongBanConfig } from '@/config/crud-configs/phong-ban.config'
import { ROUTES } from '@/constants/routes'

export default function PhongBanPage() {
  return (
    <CrudTablePage
      config={phongBanConfig}
      routePattern={ROUTES.hrDepartments}
    />
  )
}

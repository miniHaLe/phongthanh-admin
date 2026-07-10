import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { phuongXaConfig } from '@/config/crud-configs/phuong-xa.config'
import { ROUTES } from '@/constants/routes'

export default function PhuongXaPage() {
  return (
    <CrudTablePage config={phuongXaConfig} routePattern={ROUTES.catalogWard} />
  )
}

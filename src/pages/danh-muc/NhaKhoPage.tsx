import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { nhaKhoConfig } from '@/config/crud-configs/nha-kho.config'
import { ROUTES } from '@/constants/routes'

export default function NhaKhoPage() {
  return (
    <CrudTablePage
      config={nhaKhoConfig}
      routePattern={ROUTES.catalogWarehouse}
    />
  )
}

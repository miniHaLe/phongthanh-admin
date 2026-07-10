import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { nhaSanXuatConfig } from '@/config/crud-configs/nha-san-xuat.config'
import { ROUTES } from '@/constants/routes'

export default function NhaSanXuatPage() {
  return (
    <CrudTablePage
      config={nhaSanXuatConfig}
      routePattern={ROUTES.catalogManufacturer}
    />
  )
}

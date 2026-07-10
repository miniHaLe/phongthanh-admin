import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { nganChuaConfig } from '@/config/crud-configs/ngan-chua.config'
import { ROUTES } from '@/constants/routes'

export default function NganChuaPage() {
  return (
    <CrudTablePage config={nganChuaConfig} routePattern={ROUTES.catalogSlot} />
  )
}

import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { loiSuaChuaConfig } from '@/config/crud-configs/loi-sua-chua.config'
import { ROUTES } from '@/constants/routes'

export default function LoiSuaChuaPage() {
  return (
    <CrudTablePage
      config={loiSuaChuaConfig}
      routePattern={ROUTES.catalogFaultType}
    />
  )
}

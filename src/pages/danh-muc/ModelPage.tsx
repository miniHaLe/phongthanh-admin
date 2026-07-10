import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { modelConfig } from '@/config/crud-configs/model.config'
import { ROUTES } from '@/constants/routes'

export default function ModelPage() {
  return (
    <CrudTablePage config={modelConfig} routePattern={ROUTES.catalogModel} />
  )
}

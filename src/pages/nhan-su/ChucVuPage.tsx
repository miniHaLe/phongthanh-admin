import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { chucVuConfig } from '@/config/crud-configs/chuc-vu.config'
import { ROUTES } from '@/constants/routes'

export default function ChucVuPage() {
  return (
    <CrudTablePage config={chucVuConfig} routePattern={ROUTES.hrPositions} />
  )
}

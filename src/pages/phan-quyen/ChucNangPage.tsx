import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { chucNangConfig } from '@/config/crud-configs/chuc-nang.config'
import { ROUTES } from '@/constants/routes'

export default function ChucNangPage() {
  return (
    <CrudTablePage config={chucNangConfig} routePattern={ROUTES.permFeatures} />
  )
}

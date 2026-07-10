import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { ungLuongConfig } from '@/config/crud-configs/ung-luong.config'
import { ROUTES } from '@/constants/routes'

export default function UngLuongPage() {
  return (
    <CrudTablePage config={ungLuongConfig} routePattern={ROUTES.hrAdvances} />
  )
}

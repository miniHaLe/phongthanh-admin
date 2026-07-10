import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { phuCapConfig } from '@/config/crud-configs/phu-cap.config'
import { ROUTES } from '@/constants/routes'

export default function PhuCapPage() {
  return <CrudTablePage config={phuCapConfig} routePattern={ROUTES.hrAllowances} />
}

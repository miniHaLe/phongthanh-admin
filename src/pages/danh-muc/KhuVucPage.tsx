import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { khuVucConfig } from '@/config/crud-configs/khu-vuc.config'
import { ROUTES } from '@/constants/routes'

export default function KhuVucPage() {
  return (
    <CrudTablePage config={khuVucConfig} routePattern={ROUTES.catalogRegion} />
  )
}

import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { donViTinhConfig } from '@/config/crud-configs/don-vi-tinh.config'
import { ROUTES } from '@/constants/routes'

export default function DonViTinhPage() {
  return (
    <CrudTablePage config={donViTinhConfig} routePattern={ROUTES.catalogUnit} />
  )
}

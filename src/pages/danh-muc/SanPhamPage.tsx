import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { sanPhamConfig } from '@/config/crud-configs/san-pham.config'
import { ROUTES } from '@/constants/routes'

export default function SanPhamPage() {
  return (
    <CrudTablePage
      config={sanPhamConfig}
      routePattern={ROUTES.catalogProduct}
    />
  )
}

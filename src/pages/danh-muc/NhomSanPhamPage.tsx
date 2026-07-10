import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { nhomSanPhamConfig } from '@/config/crud-configs/nhom-san-pham.config'
import { ROUTES } from '@/constants/routes'

export default function NhomSanPhamPage() {
  return (
    <CrudTablePage
      config={nhomSanPhamConfig}
      routePattern={ROUTES.catalogProductCategory}
    />
  )
}

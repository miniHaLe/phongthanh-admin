import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { nhomHangHoaConfig } from '@/config/crud-configs/nhom-hang-hoa.config'
import { ROUTES } from '@/constants/routes'

export default function NhomHangHoaPage() {
  return (
    <CrudTablePage
      config={nhomHangHoaConfig}
      routePattern={ROUTES.catalogProductGroup}
    />
  )
}

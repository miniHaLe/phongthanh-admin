import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { loaiPhatThuongConfig } from '@/config/crud-configs/loai-phat-thuong.config'
import { ROUTES } from '@/constants/routes'

export default function LoaiPhatThuongPage() {
  return (
    <CrudTablePage
      config={loaiPhatThuongConfig}
      routePattern={ROUTES.hrBonusTypes}
    />
  )
}

import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { nganHangConfig } from '@/config/crud-configs/ngan-hang.config'
import { ROUTES } from '@/constants/routes'

export default function NganHangPage() {
  return (
    <CrudTablePage config={nganHangConfig} routePattern={ROUTES.catalogBanks} />
  )
}

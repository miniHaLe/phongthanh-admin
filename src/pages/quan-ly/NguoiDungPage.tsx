import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { nguoiDungConfig } from '@/config/crud-configs/nguoi-dung.config'
import { ROUTES } from '@/constants/routes'

export default function NguoiDungPage() {
  return (
    <CrudTablePage config={nguoiDungConfig} routePattern={ROUTES.manageUsers} />
  )
}

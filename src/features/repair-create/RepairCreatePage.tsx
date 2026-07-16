/**
 * Repair create page shell — toolbar with "Thêm phiếu" / "Đóng"
 * links plus the multi-fieldset RepairCreateForm. Route: /sua-chua-bao-hanh/tao-moi
 * Phase 4 owns this file.
 */
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { RepairCreateForm } from './RepairCreateForm'

export default function RepairCreatePage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Lập phiếu sửa chữa"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Sửa Chữa - Bảo Hành', href: ROUTES.repairList },
          { label: 'Lập phiếu mới' },
        ]}
      >
        <Button asChild variant="secondary" size="sm" className="h-8">
          <Link to={ROUTES.repairCreate}>Thêm phiếu</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8">
          <Link to={ROUTES.repairList}>Đóng</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-4xl">
        <RepairCreateForm />
      </div>
    </div>
  )
}

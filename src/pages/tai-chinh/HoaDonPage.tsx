/**
 * HoaDonPage — Invoice list. CrudTablePage with bulk-delete (Xóa); create
 * happens on the full-page composer (@/features/invoice-composer), not a
 * sheet — hoaDonConfig sets addLabel:false so "Lập Hóa Đơn" below is the only
 * create entry point. Route: /tai-chinh/hoa-don
 */
import { useMemo } from 'react'
import { FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { hoaDonConfig } from '@/config/finance-tables/hoa-don.config'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'

export default function HoaDonPage() {
  const navigate = useNavigate()

  const commands = useMemo(
    () => [
      {
        id: 'nav-hoa-don',
        label: 'Mở Hóa Đơn',
        group: 'Tài chính & Kho',
        icon: FileText,
        keywords: ['hoa don', 'invoice', 'tai chinh'],
        run: () => navigate(ROUTES.financeInvoices),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-hoa-don', commands)

  return (
    <div className="space-y-0">
      <PageHeader
        title="Hóa Đơn"
        breadcrumbs={[
          { label: 'Tài Chính', href: ROUTES.finance },
          { label: 'Hóa Đơn' },
        ]}
      >
        <Button size="sm" className="h-8" onClick={() => navigate(ROUTES.financeInvoicesCreate)}>
          Lập Hóa Đơn
        </Button>
      </PageHeader>
      <CrudTablePage config={hoaDonConfig} routePattern={ROUTES.financeInvoices} />
    </div>
  )
}

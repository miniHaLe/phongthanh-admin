/**
 * Repair detail page — thin orchestrator composing the legacy fieldset/log
 * sections. Route: /sua-chua-bao-hanh/:id   Phase 4 owns this file.
 */
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared'
import { fetchRepairById } from '@/domains/repair/mock-data'
import { openPrintWindow } from '@/components/print/print-window'
import { PrintLayout } from '@/components/print/print-layout'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import type { RepairTicket } from '@/domains/repair/types'
import { UpdateStatusModal } from '@/features/repair-shared/update-status-modal'
import { ProductInfoSection } from './sections/ProductInfoSection'
import { TicketInfoSection } from './sections/TicketInfoSection'
import { CustomerInfoSection } from './sections/CustomerInfoSection'
import { ReceiveInfoSection } from './sections/ReceiveInfoSection'
import { ImageGallerySection } from './sections/ImageGallerySection'
import { StatusLogTable } from './sections/StatusLogTable'
import { DispatchLogTable } from './sections/DispatchLogTable'
import { BranchTransferLog } from './sections/BranchTransferLog'
import { PartsIssuedTable } from './sections/PartsIssuedTable'
import { PartsReturnedTable } from './sections/PartsReturnedTable'
import { SerialHistoryPanel } from './sections/SerialHistoryPanel'
import { printTemSuaChua } from './prints/tem-sua-chua-print'

/** "In Biên Nhận" — plain receipt print built inline for the detail toolbar. */
function printBienNhan(ticket: RepairTicket) {
  return openPrintWindow(
    'Biên nhận',
    <PrintLayout
      title="BIÊN NHẬN SỬA CHỮA"
      signatures={['Khách hàng', 'Người nhận']}
    >
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{ticket.soPhieu}</td>
          </tr>
          <tr>
            <td>Khách hàng</td>
            <td>{ticket.khachHang.ten}</td>
          </tr>
          <tr>
            <td>Điện thoại</td>
            <td>{ticket.khachHang.sdt}</td>
          </tr>
          <tr>
            <td>Sản phẩm</td>
            <td>{ticket.tenSanPham}</td>
          </tr>
          <tr>
            <td>Mô tả hư hỏng</td>
            <td>{ticket.moTaLoi}</td>
          </tr>
          <tr>
            <td>Ngày nhận</td>
            <td>{formatDate(ticket.ngayNhan)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

/** Full-page skeleton while loading. */
function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function RepairDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [statusOpen, setStatusOpen] = useState(false)

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['repair-detail', id],
    queryFn: () => fetchRepairById(id ?? ''),
    enabled: !!id,
  })

  if (isLoading) return <DetailSkeleton />

  if (isError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-muted-foreground">
          Không tìm thấy phiếu sửa chữa
        </p>
        <Button variant="outline" onClick={() => navigate(ROUTES.repairList)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={ticket.soPhieu}
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Sửa Chữa - Bảo Hành', href: ROUTES.repairList },
          { label: ticket.soPhieu },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setStatusOpen(true)}
        >
          <RefreshCw className="mr-1.5 size-4" />
          Đổi tình trạng
        </Button>
        <Button asChild variant="secondary" size="sm" className="h-8">
          <Link to={ROUTES.repairCreate}>Tạo mới</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => printTemSuaChua(ticket)}
        >
          In Tem Sửa Chữa
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => printBienNhan(ticket)}
        >
          In Biên Nhận
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8">
          <Link to={ROUTES.repairList}>Danh sách phiếu</Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <ProductInfoSection ticket={ticket} />
          </div>
          <div className="space-y-4">
            <TicketInfoSection ticket={ticket} />
          </div>
        </div>

        <CustomerInfoSection ticket={ticket} />
        <ReceiveInfoSection ticket={ticket} />
        <ImageGallerySection ticket={ticket} />
        <StatusLogTable entries={ticket.statusHistory} />
        <DispatchLogTable entries={ticket.dispatchLog ?? []} />
        <BranchTransferLog entries={ticket.branchTransferLog ?? []} />
        <PartsIssuedTable entries={ticket.partsIssued ?? []} />
        <PartsReturnedTable entries={ticket.partsReturned ?? []} />
        <SerialHistoryPanel
          serial={ticket.soSerial ?? ''}
          excludeId={ticket.id}
        />
      </div>

      {statusOpen && (
        <UpdateStatusModal
          open={statusOpen}
          onOpenChange={setStatusOpen}
          ids={[ticket.id]}
          initialStatus={ticket.tinhTrang}
        />
      )}
    </div>
  )
}

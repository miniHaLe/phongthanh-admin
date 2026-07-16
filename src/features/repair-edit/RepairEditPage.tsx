import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { fetchRepairById } from '@/domains/repair/mock-data'
import { RepairCreateForm } from '@/features/repair-create/RepairCreateForm'
import { repairTicketToFormValues } from '@/features/repair-create/repair-form-contract'
import { RepairEditImageSection } from './repair-edit-image-section'

export default function RepairEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const ticketQuery = useQuery({
    queryKey: ['repair-detail', id],
    queryFn: () => fetchRepairById(id ?? ''),
    enabled: Boolean(id),
  })

  if (ticketQuery.isLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="mx-auto h-[32rem] w-full max-w-6xl" />
      </div>
    )
  }

  const ticket = ticketQuery.data
  if (ticketQuery.isError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-muted-foreground">
          Không tìm thấy phiếu sửa chữa
        </p>
        <Button variant="outline" onClick={() => navigate(ROUTES.repairList)}>
          <ArrowLeft className="mr-2 size-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Cập nhật phiếu sửa chữa"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Sửa Chữa - Bảo Hành', href: ROUTES.repairList },
          { label: ticket.soPhieu },
        ]}
      >
        <Button asChild variant="secondary" size="sm" className="h-8">
          <Link to={ROUTES.repairCreate}>Thêm phiếu</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8">
          <Link to={ROUTES.repairList}>Đóng</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl">
        <RepairCreateForm
          mode="edit"
          ticketId={ticket.id}
          ticketNumber={ticket.soPhieu}
          defaultValues={repairTicketToFormValues(ticket)}
          statusHistory={ticket.statusHistory}
          dispatchLog={ticket.dispatchLog ?? []}
          imageSection={<RepairEditImageSection images={ticket.images ?? []} />}
        />
      </div>
    </div>
  )
}

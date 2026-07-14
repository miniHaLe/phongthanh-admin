/* oxlint-disable react/only-export-components -- Column hook intentionally owns its stateful action cell and public metadata. */
import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { Camera, Eye, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ROUTES } from '@/constants/routes'
import type { RepairTicket } from '@/domains/repair/types'
import {
  RepairAssignmentMetaStack,
  RepairCostCell,
  RepairCustomerMetaStack,
  RepairProductMetaStack,
  RepairTicketRefsCell,
} from '@/features/repair-shared/repair-table-common-meta-cells'
import {
  buildRepairGroupColumn,
  buildRepairReceiverColumn,
  buildRepairSortOnlyColumn,
  buildRepairStatusColumn,
} from '@/features/repair-shared/repair-table-column-scaffolding'
import { REPAIR_COLUMN_LABELS } from '@/features/repair-shared/repair-table-constants'
import {
  RepairKtNotesCell,
  RepairKtTimelineCell,
} from '@/features/repair-shared/repair-table-page-meta-cells'
import { UpdateStatusModal } from '@/features/repair-shared/update-status-modal'
import { UpdateImageModal } from '../UpdateImageModal'

export const TABLE_ID = 'repair-kt'

export const REPAIR_KT_COLUMN_LABELS = REPAIR_COLUMN_LABELS

export const REPAIR_KT_LEGACY_SORT_IDS = [
  'tinhTrang',
  'soPhieu',
  'sanPham',
  'kyThuat',
  'loaiSc',
  'chiPhi',
  'ngayNhan',
  'ngayGiao',
  'chiTietSc',
  'ghiChu',
  'nguoiNhan',
  'khuVuc',
] as const

function KtActionsCell({ ticket }: { ticket: RepairTicket }) {
  const navigate = useNavigate()
  const [statusOpen, setStatusOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)

  return (
    <div className="grid auto-cols-max grid-flow-col items-center gap-0.5">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 xl:h-7 xl:w-7"
              aria-label="Đổi tình trạng"
              onClick={() => setStatusOpen(true)}
            >
              <RefreshCw className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Đổi tình trạng</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 xl:h-7 xl:w-7"
              aria-label="Xem chi tiết"
              onClick={() => navigate(ROUTES.repairDetail(ticket.id))}
            >
              <Eye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Xem chi tiết</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 xl:h-7 xl:w-7"
              aria-label="Cập nhật hình ảnh"
              onClick={() => setImageOpen(true)}
            >
              <Camera className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cập nhật hình ảnh</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {statusOpen && (
        <UpdateStatusModal
          open={statusOpen}
          onOpenChange={setStatusOpen}
          ids={[ticket.id]}
          initialStatus={ticket.tinhTrang}
        />
      )}
      {imageOpen && (
        <UpdateImageModal
          open={imageOpen}
          onOpenChange={setImageOpen}
          ticketId={ticket.id}
        />
      )}
    </div>
  )
}

interface UseRepairKtColumnsReturn {
  columns: ColumnDef<RepairTicket, unknown>[]
}

export function useRepairKtColumns(): UseRepairKtColumnsReturn {
  const columns = useMemo<ColumnDef<RepairTicket, unknown>[]>(
    () => [
      buildRepairStatusColumn(),
      {
        id: 'actions',
        size: 108,
        header: 'Hành động',
        enableSorting: false,
        cell: ({ row }) => <KtActionsCell ticket={row.original} />,
      },
      buildRepairGroupColumn({
        id: 'ticketRefs',
        size: 150,
        header: 'Mã phiếu',
        sortOptions: [{ id: 'soPhieu', label: 'Phiếu sửa chữa' }],
        cell: (ticket) => <RepairTicketRefsCell ticket={ticket} />,
      }),
      buildRepairGroupColumn({
        id: 'customer',
        size: 190,
        header: 'Khách hàng',
        enableSorting: false,
        cell: (ticket) => <RepairCustomerMetaStack ticket={ticket} />,
      }),
      buildRepairGroupColumn({
        id: 'product',
        size: 175,
        header: 'Sản phẩm',
        sortOptions: [{ id: 'sanPham', label: 'Sản phẩm' }],
        cell: (ticket) => (
          <RepairProductMetaStack ticket={ticket} variant="kt" />
        ),
      }),
      buildRepairGroupColumn({
        id: 'assignment',
        size: 170,
        header: 'Phân công',
        sortOptions: [
          { id: 'kyThuat', label: 'Kỹ thuật' },
          { id: 'loaiSc', label: 'Loại sửa chữa' },
          { id: 'khuVuc', label: 'Khu vực' },
        ],
        cell: (ticket) => (
          <RepairAssignmentMetaStack ticket={ticket} variant="kt" />
        ),
      }),
      buildRepairGroupColumn({
        id: 'cost',
        size: 110,
        header: 'Chi phí',
        sortOptions: [{ id: 'chiPhi', label: 'Chi phí' }],
        cell: (ticket) => <RepairCostCell ticket={ticket} />,
      }),
      buildRepairGroupColumn({
        id: 'timeline',
        size: 190,
        header: 'Thời gian',
        sortOptions: [
          { id: 'ngayNhan', label: 'Ngày nhận' },
          { id: 'ngayGiao', label: 'Ngày giao' },
        ],
        cell: (ticket) => <RepairKtTimelineCell ticket={ticket} />,
      }),
      buildRepairGroupColumn({
        id: 'notes',
        size: 230,
        header: 'Ghi chú',
        sortOptions: [
          { id: 'chiTietSc', label: 'Chi tiết sửa chữa' },
          { id: 'ghiChu', label: 'Ghi chú' },
        ],
        cell: (ticket) => <RepairKtNotesCell ticket={ticket} />,
      }),
      buildRepairReceiverColumn(95),
      buildRepairSortOnlyColumn('tinhTrang', 'tinhTrang'),
      buildRepairSortOnlyColumn('soPhieu', 'soPhieu'),
      buildRepairSortOnlyColumn('sanPham', 'tenSanPham'),
      buildRepairSortOnlyColumn('kyThuat', 'kyThuat'),
      buildRepairSortOnlyColumn('loaiSc', 'hinhThuc'),
      buildRepairSortOnlyColumn('chiPhi', 'chiPhiDuKien'),
      buildRepairSortOnlyColumn('ngayNhan', 'ngayNhan'),
      buildRepairSortOnlyColumn('ngayGiao', 'ngayGiao'),
      buildRepairSortOnlyColumn('chiTietSc', 'noiDungSuaChua'),
      buildRepairSortOnlyColumn('ghiChu', 'ghiChu'),
      buildRepairSortOnlyColumn('nguoiNhan', 'nguoiNhan'),
      buildRepairSortOnlyColumn('khuVuc', 'khuVuc'),
    ],
    [],
  )

  return { columns }
}

import { Fragment, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Eye } from 'lucide-react'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ROUTES } from '@/constants/routes'
import { STATUS_HEX, STATUS_LABEL } from '@/domains/repair/status'
import { HINH_THUC_LABEL, type RepairTicket } from '@/domains/repair/types'
import { formatDate, formatDateTime, formatVND } from '@/lib/format'
import { UpdateImageModal } from '../UpdateImageModal'

export const TABLE_ID = 'repair-kt'

const META_LABEL_CLASS = 'text-xs font-medium text-muted-foreground'

export const REPAIR_KT_COLUMN_LABELS: Array<{ id: string; label: string }> = [
  { id: 'status', label: 'Trạng thái' },
  { id: 'actions', label: 'Hành động' },
  { id: 'ticketRefs', label: 'Mã phiếu' },
  { id: 'customer', label: 'Khách hàng' },
  { id: 'product', label: 'Sản phẩm' },
  { id: 'assignment', label: 'Phân công' },
  { id: 'cost', label: 'Chi phí' },
  { id: 'timeline', label: 'Thời gian' },
  { id: 'notes', label: 'Ghi chú' },
  { id: 'receiver', label: 'Người nhận' },
]

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

function renderStatusCell(ticket: RepairTicket) {
  return (
    <div
      className="flex min-h-11 items-center justify-center px-1"
      style={{ backgroundColor: STATUS_HEX[ticket.tinhTrang] }}
    >
      <span className="line-clamp-2 rounded bg-white/90 px-1.5 py-0.5 text-center text-xs font-bold uppercase leading-tight text-black">
        {STATUS_LABEL[ticket.tinhTrang]}
      </span>
    </div>
  )
}

function renderTicketRefsCell(ticket: RepairTicket) {
  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Phiếu</span>
      <TableProtectedValue>
        <Link
          to={ROUTES.repairDetail(ticket.id)}
          className="font-mono text-sm font-semibold text-primary hover:underline"
        >
          {ticket.soPhieu}
        </Link>
      </TableProtectedValue>
      {ticket.soPhieuHang && (
        <Fragment>
          <span className={META_LABEL_CLASS}>PSC hãng</span>
          <TableProtectedValue className="text-xs text-muted-foreground">
            {ticket.soPhieuHang}
          </TableProtectedValue>
        </Fragment>
      )}
      {ticket.soPhieuDaiLy && (
        <Fragment>
          <span className={META_LABEL_CLASS}>PSC ĐL</span>
          <TableProtectedValue className="text-xs text-muted-foreground">
            {ticket.soPhieuDaiLy}
          </TableProtectedValue>
        </Fragment>
      )}
    </TableMetaStack>
  )
}

function renderCustomerCell(ticket: RepairTicket) {
  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Tên</span>
      <TableDescription
        value={ticket.khachHang.ten}
        className="text-sm font-bold"
      />
      <span className={META_LABEL_CLASS}>SĐT</span>
      <TableProtectedValue className="text-xs text-muted-foreground">
        {ticket.khachHang.sdt}
      </TableProtectedValue>
      <span className={META_LABEL_CLASS}>Địa chỉ</span>
      <TableDescription
        value={ticket.khachHang.diaChi}
        className="text-xs text-muted-foreground"
      />
    </TableMetaStack>
  )
}

function renderProductCell(ticket: RepairTicket) {
  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Sản phẩm</span>
      <TableDescription value={ticket.tenSanPham} className="text-sm" />
      {ticket.soSerial && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Serial</span>
          <TableProtectedValue className="text-xs text-muted-foreground">
            {ticket.soSerial}
          </TableProtectedValue>
        </Fragment>
      )}
    </TableMetaStack>
  )
}

function renderAssignmentCell(ticket: RepairTicket) {
  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Kỹ thuật</span>
      <TableDescription
        value={ticket.kyThuat || '—'}
        className="text-sm font-medium"
      />
      <span className={META_LABEL_CLASS}>Loại SC</span>
      <span className="text-xs">{HINH_THUC_LABEL[ticket.hinhThuc]}</span>
      <span className={META_LABEL_CLASS}>Khu vực</span>
      <TableDescription value={ticket.khuVuc ?? '—'} className="text-xs" />
    </TableMetaStack>
  )
}

function renderNotesCell(ticket: RepairTicket) {
  return (
    <TableMetaStack className="text-xs">
      <span className={META_LABEL_CLASS}>Chi tiết SC</span>
      <TableDescription value={ticket.noiDungSuaChua ?? '—'} />
      <span className={META_LABEL_CLASS}>Ghi chú</span>
      <TableDescription
        value={ticket.ghiChu ?? '—'}
        className="text-muted-foreground"
      />
    </TableMetaStack>
  )
}

interface UseRepairKtColumnsReturn {
  columns: ColumnDef<RepairTicket, unknown>[]
}

export function useRepairKtColumns(): UseRepairKtColumnsReturn {
  const columns = useMemo<ColumnDef<RepairTicket, unknown>[]>(
    () => [
      {
        id: 'status',
        size: 104,
        header: 'Trạng thái',
        meta: {
          compositeSortOptions: [{ id: 'tinhTrang', label: 'Trạng thái' }],
        },
        cell: ({ row }) => renderStatusCell(row.original),
      },
      {
        id: 'actions',
        size: 80,
        header: 'Hành động',
        enableSorting: false,
        cell: ({ row }) => <KtActionsCell ticket={row.original} />,
      },
      {
        id: 'ticketRefs',
        size: 150,
        header: 'Mã phiếu',
        meta: {
          compositeSortOptions: [{ id: 'soPhieu', label: 'Phiếu sửa chữa' }],
        },
        cell: ({ row }) => renderTicketRefsCell(row.original),
      },
      {
        id: 'customer',
        size: 190,
        header: 'Khách hàng',
        enableSorting: false,
        cell: ({ row }) => renderCustomerCell(row.original),
      },
      {
        id: 'product',
        size: 175,
        header: 'Sản phẩm',
        meta: {
          compositeSortOptions: [{ id: 'sanPham', label: 'Sản phẩm' }],
        },
        cell: ({ row }) => renderProductCell(row.original),
      },
      {
        id: 'assignment',
        size: 170,
        header: 'Phân công',
        meta: {
          compositeSortOptions: [
            { id: 'kyThuat', label: 'Kỹ thuật' },
            { id: 'loaiSc', label: 'Loại sửa chữa' },
            { id: 'khuVuc', label: 'Khu vực' },
          ],
        },
        cell: ({ row }) => renderAssignmentCell(row.original),
      },
      {
        id: 'cost',
        size: 110,
        header: 'Chi phí',
        meta: {
          compositeSortOptions: [{ id: 'chiPhi', label: 'Chi phí' }],
        },
        cell: ({ row }) => (
          <TableProtectedValue tabular className="text-sm">
            {formatVND(row.original.giaBaoGia ?? row.original.chiPhiDuKien)}
          </TableProtectedValue>
        ),
      },
      {
        id: 'timeline',
        size: 190,
        header: 'Thời gian',
        meta: {
          compositeSortOptions: [
            { id: 'ngayNhan', label: 'Ngày nhận' },
            { id: 'ngayGiao', label: 'Ngày giao' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack className="text-xs">
            <span className={META_LABEL_CLASS}>Nhận</span>
            <TableProtectedValue tabular>
              {formatDateTime(row.original.ngayNhan)}
            </TableProtectedValue>
            <span className={META_LABEL_CLASS}>Giao</span>
            <TableProtectedValue tabular className="text-muted-foreground">
              {row.original.ngayGiao ? formatDate(row.original.ngayGiao) : '—'}
            </TableProtectedValue>
          </TableMetaStack>
        ),
      },
      {
        id: 'notes',
        size: 230,
        header: 'Ghi chú',
        meta: {
          compositeSortOptions: [
            { id: 'chiTietSc', label: 'Chi tiết sửa chữa' },
            { id: 'ghiChu', label: 'Ghi chú' },
          ],
        },
        cell: ({ row }) => renderNotesCell(row.original),
      },
      {
        id: 'receiver',
        size: 95,
        header: 'Người nhận',
        meta: {
          compositeSortOptions: [{ id: 'nguoiNhan', label: 'Người nhận' }],
        },
        cell: ({ row }) => (
          <TableDescription
            value={row.original.nguoiNhan}
            className="text-sm"
          />
        ),
      },
      {
        id: 'tinhTrang',
        accessorKey: 'tinhTrang',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'soPhieu',
        accessorKey: 'soPhieu',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'sanPham',
        accessorKey: 'tenSanPham',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'kyThuat',
        accessorKey: 'kyThuat',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'loaiSc',
        accessorKey: 'hinhThuc',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'chiPhi',
        accessorKey: 'chiPhiDuKien',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'ngayNhan',
        accessorKey: 'ngayNhan',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'ngayGiao',
        accessorKey: 'ngayGiao',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'chiTietSc',
        accessorKey: 'noiDungSuaChua',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'ghiChu',
        accessorKey: 'ghiChu',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'nguoiNhan',
        accessorKey: 'nguoiNhan',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'khuVuc',
        accessorKey: 'khuVuc',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
    ],
    [],
  )

  return { columns }
}

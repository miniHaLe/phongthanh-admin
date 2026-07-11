import { Fragment, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { MapPin, Navigation } from 'lucide-react'
import { buildSelectionColumn } from '@/components/shared'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import { useTableState } from '@/components/shared/data-table/use-table-state'
import { ROUTES } from '@/constants/routes'
import { STATUS_HEX, STATUS_LABEL } from '@/domains/repair/status'
import {
  HINH_THUC_LABEL,
  LOAI_BAO_HANH_LABEL,
  type RepairTicket,
} from '@/domains/repair/types'
import {
  formatDate,
  formatDateTime,
  formatDwell,
  formatVND,
} from '@/lib/format'
import { buildMapUrl, openExternal } from '@/lib/open-external'
import { DispatchCell } from '../components/dispatch-cell'
import { RowActionsCell } from '../components/row-actions-cell'

export const TABLE_ID = 'repair-list'

const REF_NOW = new Date('2024-07-01T00:00:00.000Z').getTime()
const META_LABEL_CLASS = 'text-xs font-medium text-muted-foreground'

export const REPAIR_COLUMN_LABELS: Array<{ id: string; label: string }> = [
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

export const REPAIR_LEGACY_SORT_IDS = [
  'tinhTrang',
  'soPhieu',
  'sanPham',
  'chiPhi',
  'ngayNhan',
  'ngayHt',
  'nguoiNhan',
] as const

interface UseRepairTableColumnsReturn {
  columns: ColumnDef<RepairTicket, unknown>[]
  columnVisibility: Record<string, boolean>
  setColumnVisibility: (v: Record<string, boolean>) => void
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
          title={`Hư hỏng: ${ticket.moTaLoi}\nĐịa chỉ: ${ticket.khachHang.diaChi}\nCN: ${ticket.branchId}`}
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
  const customer = ticket.khachHang
  return (
    <div className="min-w-0 space-y-1">
      <TableMetaStack>
        <span className={META_LABEL_CLASS}>Tên</span>
        <TableDescription value={customer.ten} className="text-sm font-bold" />
        <span className={META_LABEL_CLASS}>SĐT</span>
        <TableProtectedValue className="text-xs text-muted-foreground">
          {customer.sdt}
        </TableProtectedValue>
        <span className={META_LABEL_CLASS}>Địa chỉ</span>
        <TableDescription
          value={customer.diaChi}
          className="text-xs text-muted-foreground"
        />
      </TableMetaStack>
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-0.5 whitespace-nowrap text-xs text-primary hover:underline xl:min-h-0"
          onClick={() => openExternal(buildMapUrl(customer.diaChi))}
        >
          <MapPin className="size-3" /> Bản đồ
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-0.5 whitespace-nowrap text-xs text-primary hover:underline xl:min-h-0"
          onClick={() =>
            openExternal(buildMapUrl(`${customer.tinh} ${customer.huyen}`))
          }
        >
          <Navigation className="size-3" /> Định vị
        </button>
      </div>
    </div>
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
          <TableProtectedValue
            className={
              ticket.laMayDaSua
                ? 'text-xs font-semibold text-destructive'
                : 'text-xs text-muted-foreground'
            }
            title={`${ticket.soSerial}${ticket.laMayDaSua ? ' — Máy đã từng sửa chữa' : ''}`}
          >
            {ticket.soSerial}
          </TableProtectedValue>
        </Fragment>
      )}
      {ticket.daiLy && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Đại lý</span>
          <TableDescription
            value={ticket.daiLy}
            className="text-xs text-orange-600"
          />
        </Fragment>
      )}
    </TableMetaStack>
  )
}

function renderAssignmentCell(ticket: RepairTicket) {
  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Kỹ thuật</span>
      <DispatchCell ticket={ticket} />
      <span className={META_LABEL_CLASS}>Loại SC</span>
      <span className="text-xs">{HINH_THUC_LABEL[ticket.hinhThuc]}</span>
      {ticket.loaiBaoHanh && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Bảo hành</span>
          <span className="text-xs">
            {LOAI_BAO_HANH_LABEL[ticket.loaiBaoHanh]}
          </span>
        </Fragment>
      )}
      {ticket.khuVuc && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Khu vực</span>
          <TableDescription value={ticket.khuVuc} className="text-xs" />
        </Fragment>
      )}
    </TableMetaStack>
  )
}

function renderCostCell(ticket: RepairTicket) {
  const quoted = ticket.giaBaoGia != null
  return (
    <TableProtectedValue
      tabular
      className={quoted ? 'text-sm' : 'text-sm text-muted-foreground'}
    >
      {formatVND(quoted ? ticket.giaBaoGia! : ticket.chiPhiDuKien)}
    </TableProtectedValue>
  )
}

function renderTimelineCell(ticket: RepairTicket) {
  const tatDays = ticket.ngaySuaXong
    ? Math.max(
        0,
        Math.round(
          (new Date(ticket.ngaySuaXong).getTime() -
            new Date(ticket.ngayNhan).getTime()) /
            86_400_000,
        ),
      )
    : null

  return (
    <TableMetaStack className="text-xs">
      <span className={META_LABEL_CLASS}>Nhận</span>
      <TableProtectedValue tabular>
        {formatDateTime(ticket.ngayNhan)}
      </TableProtectedValue>
      <span className={META_LABEL_CLASS}>Hoàn thành</span>
      <TableProtectedValue tabular className="text-muted-foreground">
        {ticket.ngayHoanThanh ? formatDate(ticket.ngayHoanThanh) : '—'}
      </TableProtectedValue>
      {ticket.ngaySuaXong && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Sửa xong</span>
          <TableProtectedValue tabular className="text-emerald-600">
            {formatDateTime(ticket.ngaySuaXong)}
          </TableProtectedValue>
          <span className={META_LABEL_CLASS}>TAT</span>
          <TableProtectedValue tabular>{tatDays} ngày</TableProtectedValue>
        </Fragment>
      )}
      {ticket.ngayGiao && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Giao máy</span>
          <TableProtectedValue tabular>
            {formatDateTime(ticket.ngayGiao)}
          </TableProtectedValue>
        </Fragment>
      )}
      {!ticket.ngaySuaXong && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Tồn</span>
          <TableProtectedValue tabular className="text-orange-600">
            {formatDwell(ticket.ngayNhan, REF_NOW)}
          </TableProtectedValue>
        </Fragment>
      )}
    </TableMetaStack>
  )
}

function renderNotesCell(ticket: RepairTicket) {
  return (
    <TableMetaStack className="text-xs">
      <span className="font-semibold text-destructive">HH</span>
      <TableDescription value={ticket.moTaLoi} />
      {ticket.cachGiaiQuyet && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Xử lý</span>
          <TableDescription
            value={ticket.cachGiaiQuyet}
            className="text-muted-foreground"
          />
        </Fragment>
      )}
    </TableMetaStack>
  )
}

export function useRepairTableColumns(): UseRepairTableColumnsReturn {
  const { getTable, setColumnVisibility: persistVisibility } = useTableState()
  const columnVisibility = getTable(TABLE_ID).columnVisibility

  const columns = useMemo<ColumnDef<RepairTicket, unknown>[]>(
    () => [
      buildSelectionColumn<RepairTicket>(),
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
        size: 136,
        header: 'Hành động',
        enableSorting: false,
        cell: ({ row }) => <RowActionsCell ticket={row.original} />,
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
        size: 175,
        header: 'Khách hàng',
        enableSorting: false,
        cell: ({ row }) => renderCustomerCell(row.original),
      },
      {
        id: 'product',
        size: 165,
        header: 'Sản phẩm',
        meta: {
          compositeSortOptions: [{ id: 'sanPham', label: 'Sản phẩm' }],
        },
        cell: ({ row }) => renderProductCell(row.original),
      },
      {
        id: 'assignment',
        size: 165,
        header: 'Phân công',
        enableSorting: false,
        cell: ({ row }) => renderAssignmentCell(row.original),
      },
      {
        id: 'cost',
        size: 110,
        header: 'Chi phí',
        meta: {
          compositeSortOptions: [{ id: 'chiPhi', label: 'Chi phí' }],
        },
        cell: ({ row }) => renderCostCell(row.original),
      },
      {
        id: 'timeline',
        size: 190,
        header: 'Thời gian',
        meta: {
          compositeSortOptions: [
            { id: 'ngayNhan', label: 'Ngày nhận' },
            { id: 'ngayHt', label: 'Ngày hoàn thành' },
          ],
        },
        cell: ({ row }) => renderTimelineCell(row.original),
      },
      {
        id: 'notes',
        size: 155,
        header: 'Ghi chú',
        enableSorting: false,
        cell: ({ row }) => renderNotesCell(row.original),
      },
      {
        id: 'receiver',
        size: 96,
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
        id: 'ngayHt',
        accessorKey: 'ngayHoanThanh',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
      {
        id: 'nguoiNhan',
        accessorKey: 'nguoiNhan',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
    ],
    [],
  )

  return {
    columns,
    columnVisibility,
    setColumnVisibility: (v: Record<string, boolean>) =>
      persistVisibility(TABLE_ID, v),
  }
}

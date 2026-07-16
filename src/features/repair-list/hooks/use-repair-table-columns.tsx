/* oxlint-disable react/only-export-components -- Column hook exports public metadata and JSX-backed column definitions. */
import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { buildSelectionColumn } from '@/components/shared'
import { useTableState } from '@/components/shared/data-table/use-table-state'
import type { RepairTicket } from '@/domains/repair/types'
import {
  RepairAssignmentMetaStack,
  RepairCostCell,
  RepairProductMetaStack,
  RepairTicketRefsCell,
} from '@/features/repair-shared/repair-table-common-meta-cells'
import {
  buildRepairGroupColumn,
  buildRepairReceiverColumn,
  buildRepairSortOnlyColumn,
  buildRepairStatusColumn,
} from '@/features/repair-shared/repair-table-column-scaffolding'
import { REPAIR_COLUMN_LABELS as SHARED_REPAIR_COLUMN_LABELS } from '@/features/repair-shared/repair-table-constants'
import {
  RepairListCustomerCell,
  RepairListNotesCell,
  RepairListTimelineCell,
} from '@/features/repair-shared/repair-table-page-meta-cells'
import { DispatchCell } from '../components/dispatch-cell'
import { RowActionsCell } from '../components/row-actions-cell'
import { REPAIR_MOCK_REFERENCE_EPOCH_MS } from '@/domains/repair/mock-data'

export const TABLE_ID = 'repair-list'

const REF_NOW = REPAIR_MOCK_REFERENCE_EPOCH_MS

export const REPAIR_COLUMN_LABELS = SHARED_REPAIR_COLUMN_LABELS

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

export function useRepairTableColumns(): UseRepairTableColumnsReturn {
  const { getTable, setColumnVisibility: persistVisibility } = useTableState()
  const columnVisibility = getTable(TABLE_ID).columnVisibility

  const columns = useMemo<ColumnDef<RepairTicket, unknown>[]>(
    () => [
      buildSelectionColumn<RepairTicket>(),
      buildRepairStatusColumn(),
      {
        id: 'actions',
        size: 136,
        header: 'Hành động',
        enableSorting: false,
        cell: ({ row }) => <RowActionsCell ticket={row.original} />,
      },
      buildRepairGroupColumn({
        id: 'ticketRefs',
        size: 150,
        header: 'Mã phiếu',
        sortOptions: [{ id: 'soPhieu', label: 'Phiếu sửa chữa' }],
        cell: (ticket) => (
          <RepairTicketRefsCell
            ticket={ticket}
            linkTitle={`Hư hỏng: ${ticket.moTaLoi}\nĐịa chỉ: ${ticket.khachHang.diaChi}\nCN: ${ticket.branchId}`}
          />
        ),
      }),
      buildRepairGroupColumn({
        id: 'customer',
        size: 175,
        header: 'Khách hàng',
        enableSorting: false,
        cell: (ticket) => <RepairListCustomerCell ticket={ticket} />,
      }),
      buildRepairGroupColumn({
        id: 'product',
        size: 165,
        header: 'Sản phẩm',
        sortOptions: [{ id: 'sanPham', label: 'Sản phẩm' }],
        cell: (ticket) => (
          <RepairProductMetaStack ticket={ticket} variant="list" />
        ),
      }),
      buildRepairGroupColumn({
        id: 'assignment',
        size: 165,
        header: 'Phân công',
        enableSorting: false,
        cell: (ticket) => (
          <RepairAssignmentMetaStack
            ticket={ticket}
            variant="list"
            technician={<DispatchCell ticket={ticket} />}
          />
        ),
      }),
      buildRepairGroupColumn({
        id: 'cost',
        size: 110,
        header: 'Chi phí',
        sortOptions: [{ id: 'chiPhi', label: 'Chi phí' }],
        cell: (ticket) => <RepairCostCell ticket={ticket} muteEstimated />,
      }),
      buildRepairGroupColumn({
        id: 'timeline',
        size: 190,
        header: 'Thời gian',
        sortOptions: [
          { id: 'ngayNhan', label: 'Ngày nhận' },
          { id: 'ngayHt', label: 'Ngày hoàn thành' },
        ],
        cell: (ticket) => (
          <RepairListTimelineCell ticket={ticket} referenceNow={REF_NOW} />
        ),
      }),
      buildRepairGroupColumn({
        id: 'notes',
        size: 155,
        header: 'Ghi chú',
        enableSorting: false,
        cell: (ticket) => <RepairListNotesCell ticket={ticket} />,
      }),
      buildRepairReceiverColumn(96),
      buildRepairSortOnlyColumn('tinhTrang', 'tinhTrang'),
      buildRepairSortOnlyColumn('soPhieu', 'soPhieu'),
      buildRepairSortOnlyColumn('sanPham', 'tenSanPham'),
      buildRepairSortOnlyColumn('chiPhi', 'chiPhiDuKien'),
      buildRepairSortOnlyColumn('ngayNhan', 'ngayNhan'),
      buildRepairSortOnlyColumn('ngayHt', 'ngayHoanThanh'),
      buildRepairSortOnlyColumn('nguoiNhan', 'nguoiNhan'),
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

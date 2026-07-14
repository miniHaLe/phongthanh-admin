import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { StatusBadge } from '@/components/shared'
import { TableDescription } from '@/components/shared/data-table/table-cell-content'
import type { CompositeSortOption } from '@/components/shared/data-table/composite-sort-header'
import type { RepairTicket } from '@/domains/repair/types'

interface BuildRepairGroupColumnOptions {
  id: string
  size: number
  header: string
  sortOptions?: readonly CompositeSortOption[]
  enableSorting?: boolean
  cell: (ticket: RepairTicket) => ReactNode
}

export function buildRepairGroupColumn({
  id,
  size,
  header,
  sortOptions,
  enableSorting,
  cell,
}: BuildRepairGroupColumnOptions): ColumnDef<RepairTicket, unknown> {
  return {
    id,
    size,
    header,
    ...(sortOptions ? { meta: { compositeSortOptions: sortOptions } } : {}),
    ...(enableSorting === undefined ? {} : { enableSorting }),
    cell: ({ row }) => cell(row.original),
  }
}

export function buildRepairStatusColumn(): ColumnDef<RepairTicket, unknown> {
  return buildRepairGroupColumn({
    id: 'status',
    size: 104,
    header: 'Trạng thái',
    sortOptions: [{ id: 'tinhTrang', label: 'Trạng thái' }],
    cell: (ticket) => <StatusBadge status={ticket.tinhTrang} variant="table" />,
  })
}

export function buildRepairReceiverColumn(
  size: number,
): ColumnDef<RepairTicket, unknown> {
  return buildRepairGroupColumn({
    id: 'receiver',
    size,
    header: 'Người nhận',
    sortOptions: [{ id: 'nguoiNhan', label: 'Người nhận' }],
    cell: (ticket) => (
      <TableDescription value={ticket.nguoiNhan} className="text-sm" />
    ),
  })
}

export function buildRepairSortOnlyColumn(
  id: string,
  accessorKey: keyof RepairTicket,
): ColumnDef<RepairTicket, unknown> {
  return {
    id,
    accessorKey,
    enableSorting: true,
    meta: { presentation: 'sort-only' },
  }
}

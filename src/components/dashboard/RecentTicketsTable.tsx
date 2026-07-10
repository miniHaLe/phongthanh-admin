/**
 * RecentTicketsTable — last 10 tickets, TanStack Table via shared DataTable.
 * 7 columns: #, Phiếu SC, Khách hàng, Sản phẩm, Kỹ thuật, Trạng thái, Ngày nhận.
 * Default sort: receivedDate desc. Sortable on receivedDate + status.
 * Row click → repair detail route.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/shared'
import { StatusBadge } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/lib/format'
import { BRANCH_NAME } from '@/mock/seed/branches'
import type { RecentTicket } from '@/types/dashboard-types'

interface RecentTicketsTableProps {
  tickets: RecentTicket[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

const columns: ColumnDef<RecentTicket, unknown>[] = [
  {
    id: 'index',
    header: '#',
    // Row index rendered via cell context
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.index + 1}
      </span>
    ),
    enableSorting: false,
    size: 40,
  },
  {
    accessorKey: 'ticketCode',
    header: 'Phiếu SC',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-medium">
        {getValue() as string}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'customerName',
    header: 'Khách hàng',
    enableSorting: false,
  },
  {
    accessorKey: 'productName',
    header: 'Sản phẩm',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'technicianName',
    header: 'Kỹ thuật',
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ getValue }) => (
      <StatusBadge status={getValue() as RecentTicket['status']} showStrip />
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'receivedDate',
    header: 'Ngày nhận',
    cell: ({ getValue, row }) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDate(getValue() as string)}{' '}
        <span className="hidden text-xs xl:inline">
          — {BRANCH_NAME[row.original.branchId]}
        </span>
      </span>
    ),
    enableSorting: true,
    sortingFn: 'datetime',
  },
]

export function RecentTicketsTable({
  tickets,
  isLoading,
  isError,
  onRetry,
}: RecentTicketsTableProps) {
  const navigate = useNavigate()
  // Default: receivedDate descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'receivedDate', desc: true },
  ])

  const stableColumns = useMemo(() => columns, [])

  function handleRowClick(ticket: RecentTicket) {
    navigate(ROUTES.repairDetail(ticket.id))
  }

  return (
    <DataTable
      tableId="dashboard-recent-tickets"
      columns={stableColumns}
      data={tickets}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      emptyMessage="Chưa có phiếu sửa chữa nào"
      sorting={sorting}
      onSortingChange={setSorting}
      onRowClick={handleRowClick}
    />
  )
}

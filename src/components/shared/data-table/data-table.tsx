import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type VisibilityState,
  type RowSelectionState,
  type OnChangeFn,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CircleAlert,
  Inbox,
} from 'lucide-react'
import { useTableState } from './use-table-state'
import { Button } from '@/components/ui/button'

export interface DataTableProps<TData> {
  /** Stable id for persisting column state. */
  tableId: string
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyMessage?: string
  emptyAction?: React.ReactNode
  /** Controlled sorting (optional). */
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  /** Manual pagination flag (server-style). Rendering handled by parent via toolbar/pagination. */
  manualPagination?: boolean
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number
  /** Toolbar slot rendered above the table. */
  toolbar?: React.ReactNode
  /** Row click handler (row navigation). */
  onRowClick?: (row: TData) => void
  /** Enable controlled row selection (opt-in). */
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** Stable row id resolver for selection keys (defaults to row index). */
  getRowId?: (row: TData, index: number) => string
  /** Extra className for the scroll container. */
  className?: string
}

/**
 * The ONE generic table (C3). TanStack headless + shadcn Table primitives.
 * Handles loading / empty / error states, sortable headers, sticky header,
 * column visibility (persisted per tableId), density.
 * Phase 4/5/6 supply column defs only — no bespoke table primitives.
 */
export function DataTable<TData>({
  tableId,
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  emptyMessage = 'Không có dữ liệu',
  emptyAction,
  sorting,
  onSortingChange,
  manualPagination,
  pagination,
  onPaginationChange,
  pageCount,
  toolbar,
  onRowClick,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  className,
}: DataTableProps<TData>) {
  const persisted = useTableState((s) => s.tables[tableId])
  const density = persisted?.density ?? 'comfortable'

  const columnVisibility: VisibilityState = useMemo(
    () => persisted?.columnVisibility ?? {},
    [persisted?.columnVisibility],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      ...(sorting ? { sorting } : {}),
      columnVisibility,
      ...(pagination ? { pagination } : {}),
      ...(rowSelection ? { rowSelection } : {}),
    },
    onSortingChange,
    onPaginationChange,
    manualPagination,
    pageCount,
    enableRowSelection,
    onRowSelectionChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rowPad = density === 'compact' ? 'py-1.5' : 'py-3'
  const visibleColCount = table.getVisibleLeafColumns().length || columns.length

  return (
    <div className="space-y-3">
      {toolbar}
      <div
        className={cn(
          'relative overflow-x-auto rounded-lg border bg-card',
          className,
        )}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      className="whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                          aria-label={`Sắp xếp theo cột`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === 'asc' ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: visibleColCount }).map((__, j) => (
                    <TableCell key={j} className={rowPad}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={visibleColCount} className="h-64">
                  <EmptyState
                    icon={CircleAlert}
                    heading="Có lỗi xảy ra"
                    body="Không thể tải dữ liệu."
                    action={
                      onRetry
                        ? { label: 'Thử lại', onClick: onRetry }
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColCount} className="h-64">
                  <EmptyState
                    icon={Inbox}
                    heading={emptyMessage}
                    action={undefined}
                  >
                    {emptyAction}
                  </EmptyState>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={rowPad}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/** Small helper: a sortable-header retry-less error retry button (exported for reuse). */
export function TableRetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onRetry}>
      Thử lại
    </Button>
  )
}

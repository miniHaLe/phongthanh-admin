/**
 * Report results grid (Phase 7). A SEPARATE headless TanStack table — not the
 * shared DataTable — because reports need a pinned footer-totals row that the
 * shared DataTable does not support. Report-specific: no pagination, horizontal
 * scroll, sticky header, error banner with retry, footer totals.
 */
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowDown, ArrowUp, ArrowUpDown, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportRow } from '@/mock/reports/report-types'

interface ReportResultsTableProps {
  columns: ColumnDef<ReportRow>[]
  data: ReportRow[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  /** Optional footer totals row (key→formatted string). */
  footerTotals?: Record<string, string>
  className?: string
}

const SKELETON_ROWS = 8

export function ReportResultsTable({
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  footerTotals,
  className,
}: ReportResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const colCount = columns.length

  if (isError) {
    return (
      <Alert
        variant="destructive"
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          <AlertDescription>
            Không thể tải dữ liệu. Vui lòng thử lại.
          </AlertDescription>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="shrink-0"
          >
            Thử lại
          </Button>
        )}
      </Alert>
    )
  }

  return (
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
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
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
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <TableCell key={j} className="py-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap py-2.5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>

        {footerTotals && !isLoading && data.length > 0 && (
          <TableFooter>
            <TableRow className="bg-muted/60 font-medium">
              {table.getVisibleLeafColumns().map((col, idx) => (
                <TableCell key={col.id} className="whitespace-nowrap py-2.5">
                  {idx === 0 ? 'Tổng cộng' : (footerTotals[col.id] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}

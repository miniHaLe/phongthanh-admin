/**
 * KPI results table (Phase 7 — owned exclusively).
 * Columns vary by period mode — derived from `mode` prop, not hardcoded arrays.
 * Sticky header, sortable, footer totals row. Default sort: Tổng phiếu desc.
 */
import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
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
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { formatVND, formatNumber } from '@/lib/format'
import type { KpiRow, PeriodMode } from '@/mock/reports/report-types'

interface KpiResultsTableProps {
  data: KpiRow[]
  mode: PeriodMode
}

/** Derive the period column label from mode. */
function periodLabel(mode: PeriodMode): string {
  if (mode === 'ngay') return 'Ngày'
  if (mode === 'thang') return 'Tháng'
  return 'Năm'
}

/** Build columns dynamically based on mode — one source of truth. */
function buildColumns(mode: PeriodMode): ColumnDef<KpiRow>[] {
  return [
    {
      accessorKey: 'period',
      header: periodLabel(mode),
      enableSorting: true,
    },
    {
      accessorKey: 'kyThuat',
      header: 'Kỹ thuật viên',
      enableSorting: true,
    },
    {
      accessorKey: 'chiNhanh',
      header: 'Chi nhánh',
      enableSorting: true,
    },
    {
      accessorKey: 'tongPhieu',
      header: 'Tổng phiếu',
      enableSorting: true,
      cell: ({ getValue }) => formatNumber(getValue() as number),
    },
    {
      accessorKey: 'hoanThanh',
      header: 'Hoàn thành',
      enableSorting: true,
      cell: ({ getValue }) => formatNumber(getValue() as number),
    },
    {
      accessorKey: 'dangSua',
      header: 'Đang sửa',
      enableSorting: true,
      cell: ({ getValue }) => formatNumber(getValue() as number),
    },
    {
      accessorKey: 'quaHan',
      header: 'Quá hạn',
      enableSorting: true,
      cell: ({ getValue }) => formatNumber(getValue() as number),
    },
    {
      accessorKey: 'chiPhi',
      header: 'Chi phí (VNĐ)',
      enableSorting: true,
      cell: ({ getValue }) => formatVND(getValue() as number),
    },
  ]
}

/** Compute footer totals across numeric fields. */
function computeTotals(data: KpiRow[]) {
  return data.reduce(
    (acc, row) => ({
      tongPhieu: acc.tongPhieu + row.tongPhieu,
      hoanThanh: acc.hoanThanh + row.hoanThanh,
      dangSua: acc.dangSua + row.dangSua,
      quaHan: acc.quaHan + row.quaHan,
      chiPhi: acc.chiPhi + row.chiPhi,
    }),
    { tongPhieu: 0, hoanThanh: 0, dangSua: 0, quaHan: 0, chiPhi: 0 },
  )
}

export function KpiResultsTable({ data, mode }: KpiResultsTableProps) {
  // Default sort: Tổng phiếu desc
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tongPhieu', desc: true },
  ])

  const columns = useMemo(() => buildColumns(mode), [mode])
  const totals = useMemo(() => computeTotals(data), [data])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const footerMap: Record<string, string> = {
    tongPhieu: formatNumber(totals.tongPhieu),
    hoanThanh: formatNumber(totals.hoanThanh),
    dangSua: formatNumber(totals.dangSua),
    quaHan: formatNumber(totals.quaHan),
    chiPhi: formatVND(totals.chiPhi),
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border bg-card">
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="whitespace-nowrap py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>

        {data.length > 0 && (
          <TableFooter>
            <TableRow className="bg-muted/60 font-medium">
              {table.getVisibleLeafColumns().map((col, idx) => (
                <TableCell key={col.id} className="whitespace-nowrap py-2.5">
                  {idx === 0
                    ? 'Tổng cộng'
                    : idx === 1 || idx === 2
                      ? ''
                      : (footerMap[col.id] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}

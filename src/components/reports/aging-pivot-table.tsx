import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface AgingPivotColumn<TRow> {
  key: string
  label: string
  getValue: (row: TRow) => number
}

interface AgingPivotTableProps<TRow> {
  rows: readonly TRow[]
  rowHeader: string
  getRowId: (row: TRow) => string | number
  getRowLabel: (row: TRow) => string
  columns: readonly AgingPivotColumn<TRow>[]
  onCellClick?: (row: TRow, columnKey: string) => void
}

export function AgingPivotTable<TRow>({
  rows,
  rowHeader,
  getRowId,
  getRowLabel,
  columns,
  onCellClick,
}: AgingPivotTableProps<TRow>) {
  return (
    <div className="relative overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
          <TableRow>
            <TableHead className="w-14 whitespace-nowrap text-center">
              STT
            </TableHead>
            <TableHead className="min-w-44 whitespace-nowrap">
              {rowHeader}
            </TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className="whitespace-nowrap text-center"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const rowLabel = getRowLabel(row)
            return (
              <TableRow key={getRowId(row)}>
                <TableCell className="text-center tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {rowLabel}
                </TableCell>
                {columns.map((column) => {
                  const value = column.getValue(row)
                  return (
                    <TableCell
                      key={column.key}
                      className="text-center tabular-nums"
                    >
                      {value > 0 && onCellClick ? (
                        <button
                          type="button"
                          className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`${rowLabel}, nhóm ${column.label}, ${value} phiếu`}
                          onClick={() => onCellClick(row, column.key)}
                        >
                          {value}
                        </button>
                      ) : (
                        value
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

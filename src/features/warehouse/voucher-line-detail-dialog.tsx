import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface VoucherLineDetailColumn<Row> {
  header: string
  cell: (row: Row) => ReactNode
  className?: string
}

interface VoucherLineDetailDialogProps<Row> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  rows: Row[]
  columns: VoucherLineDetailColumn<Row>[]
  getRowId: (row: Row) => string
  emptyMessage: string
  summary?: ReactNode
  actions?: ReactNode
}

export function VoucherLineDetailDialog<Row>({
  open,
  onOpenChange,
  title,
  rows,
  columns,
  getRowId,
  emptyMessage,
  summary,
  actions,
}: VoucherLineDetailDialogProps<Row>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-6xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{rows.length} dòng chi tiết</DialogDescription>
        </DialogHeader>

        {(summary || actions) && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 p-3">
            <div>{summary}</div>
            <div>{actions}</div>
          </div>
        )}

        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.header} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={getRowId(row)}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.header}
                        className={column.className}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

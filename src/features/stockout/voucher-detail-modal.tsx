/**
 * Generic "Chi tiết" detail modal for the stock-out (xuất kho) lists — renders
 * a label/value list for a single voucher/slip row. Local to `stockout` (kept
 * separate from `@/features/warehouse/voucher-detail-modal`, owned by the
 * warehouse phase) so the two features stay decoupled.
 */
import { Fragment } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface VoucherDetailRow {
  label: string
  value: React.ReactNode
}

interface VoucherDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  rows: VoucherDetailRow[]
}

export function VoucherDetailModal({
  open,
  onOpenChange,
  title,
  rows,
}: VoucherDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-sm">
          {rows.map((r) => (
            <Fragment key={r.label}>
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-medium">{r.value}</dd>
            </Fragment>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}

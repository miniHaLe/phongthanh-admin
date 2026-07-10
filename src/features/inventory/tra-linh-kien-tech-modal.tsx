/**
 * "Trả linh kiện kho kỹ thuật" modal — the Tồn Kho Kỹ Thuật (W4) row action
 * that returns a quantity of parts a technician is holding back to the
 * warehouse. Mock-only: submitting notifies success and closes: there is no
 * durable technician-stock ledger to mutate against in this view (the row's
 * numbers are derived from the read-only Kỳ carry-forward), matching the
 * "Read-only view" contract of the inventory pages.
 */
import { useId, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notify } from '@/components/shared'
import type { InventoryRow } from '@/domains/warehouse/types'

interface TraLinhKienTechModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: InventoryRow
}

export function TraLinhKienTechModal({
  open,
  onOpenChange,
  row,
}: TraLinhKienTechModalProps) {
  const id = useId()
  const [soLuong, setSoLuong] = useState(1)

  function handleSubmit() {
    notify.success('Đã trả linh kiện kho kỹ thuật')
    onOpenChange(false)
    setSoLuong(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trả linh kiện kho kỹ thuật</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{row.tenHang}</p>
            <p className="text-xs text-muted-foreground">
              Mã hàng: {row.maHang} · Kỹ thuật: {row.kyThuat ?? '—'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-soluong`}>Số lượng trả</Label>
            <Input
              id={`${id}-soluong`}
              type="number"
              min={1}
              value={soLuong}
              onChange={(e) => setSoLuong(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

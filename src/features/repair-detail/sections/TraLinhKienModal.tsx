/**
 * "Trả linh kiện" modal — return part quantity for a previously issued part.
 * Legacy endpoint carries `amount` (issued qty) and `amounttra` (qty to
 * return); this mock version just confirms + toasts (no persistence API for
 * parts-return was specced beyond the log table it feeds).
 */
import { useState } from 'react'
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
import type { PartsIssueEntry } from '@/domains/repair/types'

interface TraLinhKienModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  part: PartsIssueEntry | null
}

export function TraLinhKienModal({
  open,
  onOpenChange,
  part,
}: TraLinhKienModalProps) {
  const [soLuongTra, setSoLuongTra] = useState(1)

  function handleConfirm() {
    notify.success('Đã trả linh kiện')
    onOpenChange(false)
    setSoLuongTra(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trả linh kiện</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Linh kiện</Label>
            <Input value={part?.ten ?? ''} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Số lượng đã cấp</Label>
            <Input value={part?.soLuong ?? 0} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tlk-soluong-tra">Số lượng trả</Label>
            <Input
              id="tlk-soluong-tra"
              type="number"
              min={1}
              max={part?.soLuong ?? undefined}
              value={soLuongTra}
              onChange={(e) => setSoLuongTra(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * "Thu xác linh kiện" modal — record the old-part collection (branch +
 * quantity) for a previously issued part, per legacy `branchId`/`amount`
 * params. Mock: confirms + toasts (no persistence API specced beyond the log).
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/components/shared'
import type { PartsIssueEntry } from '@/domains/repair/types'

interface ThuXacLinhKienModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  part: PartsIssueEntry | null
}

const BRANCH_OPTIONS = [
  { id: 'dak-lak', label: 'TTBH Đăk Lăk' },
  { id: 'dak-nong', label: 'TTBH Đăk Nông' },
]

export function ThuXacLinhKienModal({
  open,
  onOpenChange,
  part,
}: ThuXacLinhKienModalProps) {
  const [branchId, setBranchId] = useState(BRANCH_OPTIONS[0].id)
  const [soLuong, setSoLuong] = useState(1)

  function handleConfirm() {
    notify.success('Đã thu xác linh kiện')
    onOpenChange(false)
    setSoLuong(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thu xác linh kiện</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Linh kiện</Label>
            <Input value={part?.ten ?? ''} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Chi nhánh</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger aria-label="Chọn chi nhánh">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_OPTIONS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="txlk-soluong">Số lượng</Label>
            <Input
              id="txlk-soluong"
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
          <Button onClick={handleConfirm}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

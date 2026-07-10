/** "Chuyển chi nhánh" modal — move checked tickets to another branch + note. */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/components/shared'
import { BRANCHES } from '@/mock/seed/branches'
import { transferBranch } from '@/domains/repair/mock-mutations'

interface TransferBranchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ids: string[]
}

export function TransferBranchModal({
  open,
  onOpenChange,
  ids,
}: TransferBranchModalProps) {
  const qc = useQueryClient()
  const [branchId, setBranchId] = useState('')
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!branchId) throw new Error('no-branch')
      transferBranch(ids, branchId, note || undefined)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
      notify.success('Đã chuyển chi nhánh')
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển chi nhánh</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Chi nhánh</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger aria-label="Chọn chi nhánh">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tb-note">Ghi chú</Label>
            <Textarea
              id="tb-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              if (!branchId) {
                notify.error('Vui lòng chọn chi nhánh!')
                return
              }
              mutation.mutate()
            }}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

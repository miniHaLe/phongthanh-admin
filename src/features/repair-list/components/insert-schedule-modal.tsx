/** "Thêm lịch nhắc nhở" modal — attach a reminder (date + note) to a ticket. */
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { notify } from '@/components/shared'
import { addScheduleReminder } from '@/domains/repair/mock-mutations'

interface InsertScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
}

export function InsertScheduleModal({
  open,
  onOpenChange,
  id,
}: InsertScheduleModalProps) {
  const qc = useQueryClient()
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      addScheduleReminder(id, { date, note })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
      notify.success('Đã thêm lịch nhắc nhở')
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm lịch nhắc nhở</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sched-date">Ngày hẹn</Label>
            <Input
              id="sched-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sched-note">Nội dung</Label>
            <Textarea
              id="sched-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

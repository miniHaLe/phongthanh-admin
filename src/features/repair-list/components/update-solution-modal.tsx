/** "Cập nhật Cách giải quyết" modal — edit a ticket's solution text. */
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
import { notify } from '@/components/shared'
import { updateSolution } from '@/domains/repair/mock-mutations'

interface UpdateSolutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
  initial?: string
}

export function UpdateSolutionModal({
  open,
  onOpenChange,
  id,
  initial,
}: UpdateSolutionModalProps) {
  const qc = useQueryClient()
  const [text, setText] = useState(initial ?? '')

  const mutation = useMutation({
    mutationFn: async () => {
      updateSolution(id, { cachGiaiQuyet: text })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
      notify.success('Đã cập nhật cách giải quyết')
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật Cách giải quyết</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="sol-text">Cách giải quyết</Label>
          <Textarea
            id="sol-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
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

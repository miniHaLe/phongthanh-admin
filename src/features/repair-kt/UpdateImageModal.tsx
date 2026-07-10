/**
 * Photo-upload row action for the KT board — technicians attach an updated
 * repair photo to a ticket straight from the list (legacy
 * repairing-UpdateImage.js workflow, no full detail navigation required).
 */
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
import { notify } from '@/components/shared'
import { addTicketMedia } from '@/domains/repair/mock-mutations'

interface UpdateImageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
}

export function UpdateImageModal({
  open,
  onOpenChange,
  ticketId,
}: UpdateImageModalProps) {
  const qc = useQueryClient()
  const [file, setFile] = useState<File | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('no-file')
      const url = URL.createObjectURL(file)
      addTicketMedia(ticketId, { url, kind: 'image' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-kt'] })
      notify.success('Đã cập nhật hình ảnh')
      onOpenChange(false)
      setFile(null)
    },
  })

  function save() {
    if (!file) {
      notify.error('Vui lòng chọn hình ảnh!')
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setFile(null)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật hình ảnh</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="kt-image-file">Chọn hình ảnh</Label>
          <Input
            id="kt-image-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={save} disabled={mutation.isPending}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

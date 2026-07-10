/** "Giao Máy" modal — hand a ticket to the customer (→ Đã Giao Cho Khách). */
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
import { checkoutDelivery } from '@/domains/repair/mock-mutations'

interface CheckoutDeliveryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
}

export function CheckoutDeliveryModal({
  open,
  onOpenChange,
  id,
}: CheckoutDeliveryModalProps) {
  const qc = useQueryClient()
  const [ngayGiao, setNgayGiao] = useState('')
  const [ghiChu, setGhiChu] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      checkoutDelivery(id, { ngayGiao, ghiChu: ghiChu || undefined })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
      notify.success('Đã giao máy cho khách')
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giao Máy</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="giao-date">Ngày giao</Label>
            <Input
              id="giao-date"
              type="date"
              value={ngayGiao}
              onChange={(e) => setNgayGiao(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="giao-note">Ghi chú</Label>
            <Textarea
              id="giao-note"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
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

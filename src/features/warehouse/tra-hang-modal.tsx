/**
 * "Trả linh kiện" bulk modal (DSTraLKXac) — collects a Mã vận đơn then calls
 * traHang(ids, maVanDon) to flip the checked rows Chưa trả hãng → Đã trả hãng.
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
import { traHang } from '@/domains/warehouse/mock-mutations'

interface TraHangModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ids: string[]
}

export function TraHangModal({ open, onOpenChange, ids }: TraHangModalProps) {
  const qc = useQueryClient()
  const [maVanDon, setMaVanDon] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!maVanDon.trim()) throw new Error('no-ma-van-don')
      return traHang(ids, maVanDon.trim())
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['part-return-xac-list'] })
      notify.success(`Đã trả hàng ${count} phiếu`)
      setMaVanDon('')
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trả linh kiện</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tra-hang-ma-van-don">Mã vận đơn</Label>
            <Input
              id="tra-hang-ma-van-don"
              value={maVanDon}
              onChange={(e) => setMaVanDon(e.target.value)}
              placeholder="Nhập mã vận đơn…"
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
              if (!maVanDon.trim()) {
                notify.error('Vui lòng nhập mã vận đơn!')
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

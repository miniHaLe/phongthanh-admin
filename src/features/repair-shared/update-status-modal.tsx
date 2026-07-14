/**
 * Shared "Đổi tình trạng" modal for repair lists and detail views. It updates
 * the in-memory ticket once, refreshes every repair surface, and replaces any
 * cached detail object so observers see the mutable mock-store change.
 */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateTicketStatus } from '@/domains/repair/mock-mutations'
import {
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_HEX,
  STATUS_LABEL,
  type RepairStatusId,
} from '@/domains/repair/status'
import type { RepairTicket } from '@/domains/repair/types'

interface UpdateStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ids: string[]
  /** Báo giá variant: preselect Báo Giá (4) and show the Giá field. */
  baoGia?: boolean
  initialStatus?: RepairStatusId
}

function fieldsFor(status: RepairStatusId | undefined) {
  if (status == null)
    return { gia: false, noiDung: true, cachGiaiQuyet: false, parts: false }
  if (status === 4 || status === 15)
    return { gia: true, noiDung: true, cachGiaiQuyet: false, parts: false }
  if (status === 9)
    return { gia: false, noiDung: true, cachGiaiQuyet: true, parts: false }
  if (status === 7 || status === 13 || status === 17)
    return { gia: false, noiDung: true, cachGiaiQuyet: false, parts: true }
  return { gia: false, noiDung: true, cachGiaiQuyet: false, parts: false }
}

export function UpdateStatusModal({
  open,
  onOpenChange,
  ids,
  baoGia,
  initialStatus,
}: UpdateStatusModalProps) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<RepairStatusId | undefined>(
    baoGia ? 4 : initialStatus,
  )
  const [gia, setGia] = useState('')
  const [noiDung, setNoiDung] = useState('')
  const [cachGiaiQuyet, setCachGiaiQuyet] = useState('')

  const show = fieldsFor(status)

  const mutation = useMutation({
    mutationFn: async (withSms: boolean) => {
      if (status == null) throw new Error('no-status')
      const updated = updateTicketStatus(ids, status, {
        gia: gia ? Number(gia) : undefined,
        noiDung: noiDung || undefined,
        cachGiaiQuyet: cachGiaiQuyet || undefined,
      })
      return { updated, withSms }
    },
    onSuccess: ({ updated, withSms }) => {
      for (const ticket of updated) {
        queryClient.setQueryData<RepairTicket>(
          ['repair-detail', ticket.id],
          (current) =>
            current
              ? {
                  ...current,
                  ...ticket,
                  statusHistory: [...ticket.statusHistory],
                }
              : current,
        )
      }

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['repair-list'] }),
        queryClient.invalidateQueries({ queryKey: ['repair-kt'] }),
        queryClient.invalidateQueries({ queryKey: ['repair-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['status-distribution'] }),
      ])
      notify.success('Đã cập nhật tình trạng')
      if (withSms) notify.info('Đã gửi SMS cho khách hàng')
      onOpenChange(false)
    },
  })

  function save(withSms: boolean) {
    if (status == null) {
      notify.error('Vui lòng chọn tình trạng!')
      return
    }
    mutation.mutate(withSms)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi tình trạng</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tình trạng</Label>
            <Select
              value={status != null ? String(status) : undefined}
              onValueChange={(value) =>
                setStatus(Number(value) as RepairStatusId)
              }
            >
              <SelectTrigger aria-label="Chọn tình trạng">
                <SelectValue placeholder="Chọn tình trạng" />
              </SelectTrigger>
              <SelectContent>
                {REPAIR_STATUS_DISPLAY_ORDER.map((id) => (
                  <SelectItem key={id} value={String(id)}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: STATUS_HEX[id] }}
                      />
                      {STATUS_LABEL[id]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {show.gia && (
            <div className="space-y-1.5">
              <Label htmlFor="us-gia">Giá</Label>
              <Input
                id="us-gia"
                type="number"
                value={gia}
                onChange={(event) => setGia(event.target.value)}
              />
            </div>
          )}

          {show.cachGiaiQuyet && (
            <div className="space-y-1.5">
              <Label htmlFor="us-cgq">Cách giải quyết</Label>
              <Textarea
                id="us-cgq"
                value={cachGiaiQuyet}
                onChange={(event) => setCachGiaiQuyet(event.target.value)}
              />
              <Label className="text-xs text-muted-foreground">
                Loại sửa chữa
              </Label>
            </div>
          )}

          {show.parts && (
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Loại yêu cầu (Đặc/Ứng)</span>
              <span>Loại linh kiện</span>
              <span>Linh kiện</span>
              <span>Số lượng</span>
            </div>
          )}

          {show.noiDung && (
            <div className="space-y-1.5">
              <Label htmlFor="us-nd">Nội dung sửa chữa</Label>
              <Textarea
                id="us-nd"
                value={noiDung}
                onChange={(event) => setNoiDung(event.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => save(true)}
          >
            Lưu & SMS
          </Button>
          <Button disabled={mutation.isPending} onClick={() => save(false)}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * "Đổi tình trạng" modal — single-select of the 15 color-coded statuses with
 * per-status conditional fields. Shared by the row action, the batch toolbar
 * action, and the Báo giá variant (`baoGia` preselects Báo Giá + shows Giá).
 * On save: mutates the mock store, toasts, closes, and the caller invalidates.
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/components/shared'
import {
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_LABEL,
  STATUS_HEX,
  type RepairStatusId,
} from '@/domains/repair/status'
import { updateTicketStatus } from '@/domains/repair/mock-mutations'

interface UpdateStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ids: string[]
  /** Báo giá variant: preselect Báo Giá (4) and show the Giá field. */
  baoGia?: boolean
  initialStatus?: RepairStatusId
}

/** Which conditional fields a given status shows. */
function fieldsFor(status: RepairStatusId | undefined) {
  if (status == null) return { gia: false, noiDung: true, cachGiaiQuyet: false, parts: false }
  // Báo Giá (4) / Chờ Báo Giá (15) → Giá + Nội dung
  if (status === 4 || status === 15)
    return { gia: true, noiDung: true, cachGiaiQuyet: false, parts: false }
  // Sửa Xong (9) → Cách giải quyết
  if (status === 9)
    return { gia: false, noiDung: true, cachGiaiQuyet: true, parts: false }
  // Parts statuses: Chờ LK (7), Đã Có LK (13), Đã Đặt LK (17)
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
  const qc = useQueryClient()
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
      updateTicketStatus(ids, status, {
        gia: gia ? Number(gia) : undefined,
        noiDung: noiDung || undefined,
        cachGiaiQuyet: cachGiaiQuyet || undefined,
      })
      return withSms
    },
    onSuccess: (withSms) => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
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
              onValueChange={(v) => setStatus(Number(v) as RepairStatusId)}
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
                onChange={(e) => setGia(e.target.value)}
              />
            </div>
          )}

          {show.cachGiaiQuyet && (
            <div className="space-y-1.5">
              <Label htmlFor="us-cgq">Cách giải quyết</Label>
              <Textarea
                id="us-cgq"
                value={cachGiaiQuyet}
                onChange={(e) => setCachGiaiQuyet(e.target.value)}
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
                onChange={(e) => setNoiDung(e.target.value)}
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

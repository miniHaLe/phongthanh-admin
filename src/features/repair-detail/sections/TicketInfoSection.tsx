/**
 * "Thông tin phiếu" fieldset — Số phiếu colored by status (tooltip = status
 * name), Hình thức BH, Loại bảo hành + the one editable field on the detail
 * page: Sửa gấp (rush flag), Khu vực.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { notify } from '@/components/shared'
import { updateSuaGap } from '@/domains/repair/mock-mutations'
import { hexOf, labelOf } from '@/domains/repair/status'
import { HINH_THUC_LABEL, LOAI_BAO_HANH_LABEL } from '@/domains/repair/types'
import type { RepairTicket } from '@/domains/repair/types'

/** Warranty-location label for the 0|1 detail toggle (distinct from LoaiBaoHanh). */
const WARRANTY_AT_LABEL: Record<0 | 1, string> = {
  0: 'Tại TTBH',
  1: 'Tại Nhà',
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? '—'}</dd>
    </div>
  )
}

export function TicketInfoSection({ ticket }: { ticket: RepairTicket }) {
  const queryClient = useQueryClient()

  const suaGapMutation = useMutation({
    mutationFn: (value: boolean) => {
      updateSuaGap(ticket.id, value)
      return Promise.resolve(value)
    },
    onSuccess: () => {
      notify.success('Đã cập nhật Sửa gấp')
      queryClient.invalidateQueries({ queryKey: ['repair-detail', ticket.id] })
    },
  })

  const hex = hexOf(ticket.tinhTrang)
  const statusName = labelOf(ticket.tinhTrang)

  const loaiBaoHanhValue =
    ticket.warrantyAt != null
      ? WARRANTY_AT_LABEL[ticket.warrantyAt]
      : ticket.loaiBaoHanh
        ? LOAI_BAO_HANH_LABEL[ticket.loaiBaoHanh]
        : undefined

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Thông tin phiếu</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5">
            <dt className="text-sm text-muted-foreground">Số phiếu:</dt>
            <dd className="text-sm font-medium">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      title={statusName}
                      className="rounded px-1.5 py-0.5 font-semibold"
                      style={{ color: hex, backgroundColor: `${hex}1a` }}
                    >
                      {ticket.soPhieu}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{statusName}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </dd>
          </div>
          <InfoRow label="Số phiếu hãng:" value={ticket.soPhieuHang} />
          <InfoRow
            label="Hình thức BH:"
            value={
              <span className="font-bold">
                {HINH_THUC_LABEL[ticket.hinhThuc]}
              </span>
            }
          />
          <div className="grid grid-cols-[140px_1fr] items-center gap-2 py-1.5">
            <dt className="text-sm text-muted-foreground">Loại bảo hành:</dt>
            <dd className="flex items-center gap-3 text-sm font-medium">
              <span>{loaiBaoHanhValue ?? '—'}</span>
              <span className="flex items-center gap-1.5">
                <Checkbox
                  id="sua-gap"
                  checked={ticket.isQuick ?? false}
                  onCheckedChange={(checked) =>
                    suaGapMutation.mutate(checked === true)
                  }
                  disabled={suaGapMutation.isPending}
                />
                <Label htmlFor="sua-gap" className="cursor-pointer font-normal">
                  Sửa gấp
                </Label>
              </span>
            </dd>
          </div>
          <InfoRow label="Khu vực:" value={ticket.khuVuc} />
        </dl>
      </CardContent>
    </Card>
  )
}

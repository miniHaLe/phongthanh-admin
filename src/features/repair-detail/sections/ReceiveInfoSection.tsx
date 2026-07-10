/** "Thông tin nhận" fieldset — receive date/time, receiver, promised date, technician. */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateTime } from '@/lib/format'
import type { RepairTicket } from '@/domains/repair/types'

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

export function ReceiveInfoSection({ ticket }: { ticket: RepairTicket }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Thông tin nhận</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow
            label="Ngày nhận:"
            value={formatDateTime(ticket.ngayNhan)}
          />
          <InfoRow label="Người nhận:" value={ticket.nguoiNhan} />
          <InfoRow
            label="Ngày hẹn giao:"
            value={formatDate(ticket.ngayHenTra)}
          />
          <InfoRow label="Kỹ thuật viên:" value={ticket.kyThuat} />
        </dl>
      </CardContent>
    </Card>
  )
}

/**
 * "Thông tin khách hàng" fieldset — customer contact rows plus a bold agent
 * (Đại lý/Siêu Thị/Cửa Hàng/Trạm) sub-block when the ticket carries one.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RepairTicket } from '@/domains/repair/types'

function InfoRow({
  label,
  value,
  bold,
}: {
  label: string
  value?: React.ReactNode
  bold?: boolean
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5">
      <dt
        className={
          bold
            ? 'text-sm font-semibold text-foreground'
            : 'text-sm text-muted-foreground'
        }
      >
        {label}
      </dt>
      <dd
        className={
          bold ? 'text-sm font-semibold' : 'text-sm font-medium'
        }
      >
        {value ?? '—'}
      </dd>
    </div>
  )
}

export function CustomerInfoSection({ ticket }: { ticket: RepairTicket }) {
  const { khachHang } = ticket

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label="Họ tên:" value={khachHang.ten} />
          <InfoRow label="Mail:" value="—" />
          <InfoRow label="Điện thoại:" value={khachHang.sdt} />
          <InfoRow label="Địa chỉ:" value={khachHang.diaChi} />

          {ticket.daiLy && (
            <>
              <InfoRow
                label="Đại lý/Siêu Thị/Cửa Hàng/Trạm:"
                value={ticket.daiLy}
                bold
              />
              <InfoRow label="Điện thoại:" value={khachHang.sdt} />
              <InfoRow label="Địa chỉ:" value={khachHang.diaChi} />
            </>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}

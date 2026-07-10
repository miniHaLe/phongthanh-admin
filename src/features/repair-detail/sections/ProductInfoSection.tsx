/**
 * "Thông tin sản phẩm" fieldset — read-only product/device fields. Mô tả hư
 * hỏng and Nội dung sửa chữa render in red per the reference layout.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import type { RepairTicket } from '@/domains/repair/types'

/** dt/dd row for a read-only detail field. */
function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value?: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={valueClassName ?? 'text-sm font-medium'}>
        {value ?? '—'}
      </dd>
    </div>
  )
}

/**
 * Best-effort split of the combined `tenSanPham` display string
 * ("<Nhà sản xuất> <Sản phẩm> – <Model>") into manufacturer / model parts.
 * The ticket keeps the ids but only the combined label — this is presentation
 * only, no new data is invented.
 */
function splitTenSanPham(tenSanPham: string): { nsx: string; model: string } {
  const [left, ...rest] = tenSanPham.split('–')
  const model = rest.join('–').trim()
  return { nsx: left.trim(), model: model || tenSanPham }
}

export function ProductInfoSection({ ticket }: { ticket: RepairTicket }) {
  const { nsx, model } = splitTenSanPham(ticket.tenSanPham)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Thông tin sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label="Sản phẩm:" value={ticket.tenSanPham} />
          <InfoRow label="Nhà sản xuất:" value={nsx} />
          <InfoRow label="Model:" value={model} />
          <InfoRow label="Số Serial:" value={ticket.soSerial} />
          <InfoRow
            label="Mô tả hư hỏng:"
            value={ticket.moTaLoi}
            valueClassName="text-sm font-medium text-destructive"
          />
          <InfoRow
            label="Nội dung sửa chữa:"
            value={ticket.noiDungSuaChua}
            valueClassName="text-sm font-medium text-destructive"
          />
          <InfoRow
            label="Phụ kiện kèm theo:"
            value={ticket.phuKienKemTheo}
          />
          <InfoRow label="Ngày mua:" value={formatDate(ticket.ngayMua)} />
          <InfoRow label="Nơi mua:" value={ticket.noiMua} />
          <InfoRow label="Ghi chú:" value={ticket.ghiChu} />
        </dl>
      </CardContent>
    </Card>
  )
}

import type { Dispatch, SetStateAction } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'
import { MapPin, Pencil, Phone } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared'
import type { KhachHang } from '@/types/masterdata-types'

interface CustomerMobileCardsProps {
  customers: KhachHang[]
  rowSelection: RowSelectionState
  onSelectionChange: Dispatch<SetStateAction<RowSelectionState>>
  onEdit: (customer: KhachHang) => void
}

export function CustomerMobileCards({
  customers,
  rowSelection,
  onSelectionChange,
  onEdit,
}: CustomerMobileCardsProps) {
  if (customers.length === 0) return null

  return (
    <section className="space-y-3 md:hidden" aria-label="Danh sách khách hàng">
      {customers.map((customer) => {
        const selected = !!rowSelection[customer.id]
        const titleId = `customer-card-${customer.id}`
        const address = customer.diaChi?.trim() || 'Chưa có địa chỉ'

        return (
          <article
            key={customer.id}
            aria-labelledby={titleId}
            className="rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex min-h-11 min-w-11 items-center justify-center"
                data-touch-target=""
              >
                <Checkbox
                  aria-label={`Chọn khách hàng ${customer.tenKH}`}
                  checked={selected}
                  onCheckedChange={(checked) =>
                    onSelectionChange((previous) => ({
                      ...previous,
                      [customer.id]: !!checked,
                    }))
                  }
                />
              </span>

              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-base font-semibold">
                  {customer.tenKH}
                </h2>
                <dl className="mt-2 text-sm text-muted-foreground">
                  <TableMetaStack>
                    <dt className="flex items-center gap-1">
                      <Phone className="size-3.5" aria-hidden="true" />
                      Điện thoại
                    </dt>
                    <dd className="text-foreground">
                      <TableProtectedValue tabular>
                        {customer.dienThoai}
                      </TableProtectedValue>
                      {customer.dienThoai2 ? ` · ${customer.dienThoai2}` : ''}
                    </dd>

                    <dt className="flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      Địa chỉ
                    </dt>
                    <dd className="min-w-0 text-foreground">
                      <TableDescription value={address} />
                    </dd>
                  </TableMetaStack>
                </dl>
              </div>
            </div>

            <div className="mt-3 flex justify-end border-t pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11 gap-1.5"
                aria-label={`Chỉnh sửa khách hàng ${customer.tenKH}`}
                onClick={() => onEdit(customer)}
              >
                <Pencil className="size-4" />
                Chỉnh sửa
              </Button>
            </div>
          </article>
        )
      })}
    </section>
  )
}

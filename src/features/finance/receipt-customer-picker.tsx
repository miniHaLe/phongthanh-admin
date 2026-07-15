import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ServerAutocomplete,
  type AutocompleteOption,
} from '@/components/shared'
import { listCustomers } from '@/features/customer/create-customer'

interface ReceiptCustomerOption extends AutocompleteOption {
  customerName: string
}

async function searchReceiptCustomers(
  query: string,
): Promise<ReceiptCustomerOption[]> {
  const result = await listCustomers({
    page: 1,
    pageSize: 20,
    search: query.trim() || undefined,
  })
  return result.data.map((customer) => ({
    id: customer.id,
    label: `${customer.tenKH} — ${customer.dienThoai}`,
    customerName: customer.tenKH,
  }))
}

interface ReceiptCustomerPickerProps {
  inputId: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function ReceiptCustomerPicker({
  inputId,
  label,
  value,
  onChange,
  required,
}: ReceiptCustomerPickerProps) {
  const [guestMode, setGuestMode] = useState(false)
  const [selected, setSelected] = useState<ReceiptCustomerOption | null>(null)

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={guestMode}
            onCheckedChange={(checked) => {
              const nextGuestMode = checked === true
              setGuestMode(nextGuestMode)
              setSelected(null)
              onChange('')
            }}
          />
          Khách lẻ (nhập tự do)
        </label>
      </div>

      {guestMode ? (
        <Input
          id={inputId}
          value={value}
          placeholder="Nhập tên khách lẻ"
          required={required}
          aria-required={required || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <ServerAutocomplete
          inputId={inputId}
          ariaLabel={label}
          required={required}
          value={selected}
          onChange={(option) => {
            const next = option as ReceiptCustomerOption | null
            setSelected(next)
            onChange(next?.customerName ?? '')
          }}
          fetchOptions={searchReceiptCustomers}
          placeholder="Tìm tên / số điện thoại khách hàng"
          emptyMessage="Không tìm thấy khách hàng"
        />
      )}
    </div>
  )
}

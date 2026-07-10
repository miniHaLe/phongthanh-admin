/**
 * "Thông tin khách hàng" fieldset for the invoice composer. Mã số thuế field
 * carries a search-customer button that opens a modal matching by name/phone
 * and auto-fills Tên đơn vị + Địa chỉ (read-only labels) + hidden customerId.
 */
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { searchCustomersByNameOrPhone } from './customer-tax-search'
import type { HinhThucThanhToanId } from '@/types/finance-types'

export const HINH_THUC_CREATE_OPTIONS: { label: string; value: HinhThucThanhToanId }[] = [
  { label: 'Tiền mặt', value: 1 },
  { label: 'Công nợ', value: 2 },
  { label: 'Chuyển khoản', value: 3 },
]

export interface InvoiceHeaderValues {
  soHoaDon: string
  ngayXuat: string
  tenKhachHangMua: string
  hinhThucId: HinhThucThanhToanId | ''
  maSoThue: string
  tenDonVi: string
  diaChi: string
  customerId: string | null
}

interface InvoiceHeaderFieldsProps {
  values: InvoiceHeaderValues
  onChange: (patch: Partial<InvoiceHeaderValues>) => void
  errors: Partial<Record<keyof InvoiceHeaderValues, string>>
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function CustomerSearchModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (match: ReturnType<typeof searchCustomersByNameOrPhone>[number]) => void
}) {
  const [query, setQuery] = useState('')
  const results = searchCustomersByNameOrPhone(query)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tìm kiếm khách hàng</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Nhập tên hoặc số điện thoại"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="mt-2 max-h-72 overflow-auto rounded-md border">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {query ? 'Không có kết quả' : 'Nhập để tìm kiếm'}
            </li>
          ) : (
            results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    onSelect(r)
                    onOpenChange(false)
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

export function InvoiceHeaderFields({ values, onChange, errors }: InvoiceHeaderFieldsProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <section aria-labelledby="section-invoice-customer-info">
      <h2 id="section-invoice-customer-info" className="mb-4 text-base font-semibold">
        Thông tin khách hàng
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Số hóa đơn" htmlFor="hd-so" required error={errors.soHoaDon}>
          <Input
            id="hd-so"
            value={values.soHoaDon}
            onChange={(e) => onChange({ soHoaDon: e.target.value })}
          />
        </Field>

        <Field label="Ngày xuất" htmlFor="hd-ngayxuat" required error={errors.ngayXuat}>
          <Input
            id="hd-ngayxuat"
            type="date"
            value={values.ngayXuat}
            onChange={(e) => onChange({ ngayXuat: e.target.value })}
          />
        </Field>

        <Field
          label="Tên khách hàng mua"
          htmlFor="hd-tenkhachhang"
          required
          error={errors.tenKhachHangMua}
        >
          <Input
            id="hd-tenkhachhang"
            placeholder="Nhập tên hoặc số điện thoại"
            value={values.tenKhachHangMua}
            onChange={(e) => onChange({ tenKhachHangMua: e.target.value })}
          />
        </Field>

        <Field
          label="Hình thức thanh toán"
          htmlFor="hd-hinhthuc"
          required
          error={errors.hinhThucId}
        >
          <Select
            value={values.hinhThucId ? String(values.hinhThucId) : ''}
            onValueChange={(v) => onChange({ hinhThucId: Number(v) as HinhThucThanhToanId })}
          >
            <SelectTrigger id="hd-hinhthuc">
              <SelectValue placeholder="-- Vui lòng chọn --" />
            </SelectTrigger>
            <SelectContent>
              {HINH_THUC_CREATE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Mã số thuế" htmlFor="hd-mst" required error={errors.maSoThue}>
          <div className="flex gap-1.5">
            <Input
              id="hd-mst"
              value={values.maSoThue}
              onChange={(e) => onChange({ maSoThue: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Tìm kiếm khách hàng"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </Field>

        <div className="flex flex-col justify-end gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">Tên đơn vị: </span>
            {values.tenDonVi || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Địa chỉ: </span>
            {values.diaChi || '—'}
          </p>
        </div>
      </div>

      <CustomerSearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(match) =>
          onChange({
            customerId: match.id,
            tenDonVi: match.tenDonVi,
            diaChi: match.diaChi,
            tenKhachHangMua: values.tenKhachHangMua || match.tenDonVi,
          })
        }
      />
    </section>
  )
}

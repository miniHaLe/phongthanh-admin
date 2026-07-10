/**
 * "Thông tin khách hàng" fieldset for the Bán Hàng create/edit editor.
 * Số phiếu auto, Hình thức thanh toán* select, Khách hàng* ServerAutocomplete
 * over searchCustomers with a [+] quick-create, Ghi chú.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServerAutocomplete, notify, type AutocompleteOption } from '@/components/shared'
import { searchCustomers } from '@/domains/repair/mock-data'

export const HINH_THUC_THANH_TOAN_OPTIONS = ['Tiền mặt', 'Công nợ', 'Chuyển khoản'] as const

export interface CustomerOption extends AutocompleteOption {
  sdt: string
}

export async function searchKhachHang(query: string): Promise<CustomerOption[]> {
  const customers = await searchCustomers(query)
  return customers.map((c) => ({ id: c.id, label: c.ten, sdt: c.sdt }))
}

let quickCustomerSeq = 0

export interface BanHangHeaderValues {
  hinhThucThanhToan: string
  khachHang: CustomerOption | null
  ghiChu: string
}

interface BanHangHeaderFieldsProps {
  values: BanHangHeaderValues
  onChange: (patch: Partial<BanHangHeaderValues>) => void
  errors: Partial<Record<'hinhThucThanhToan' | 'khachHang', string>>
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function QuickCreateCustomerForm({
  close,
  select,
}: {
  close: () => void
  select: (opt: AutocompleteOption) => void
}) {
  const [ten, setTen] = useState('')
  const [sdt, setSdt] = useState('')
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-kh-ten">Tên khách hàng</Label>
        <Input id="qc-kh-ten" value={ten} onChange={(e) => setTen(e.target.value)} autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-kh-sdt">Điện thoại</Label>
        <Input id="qc-kh-sdt" value={sdt} onChange={(e) => setSdt(e.target.value)} />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!ten.trim()) {
              notify.error('Vui lòng nhập tên khách hàng!')
              return
            }
            quickCustomerSeq += 1
            select({ id: `kh-new-${quickCustomerSeq}`, label: ten.trim(), sdt } as CustomerOption)
          }}
        >
          Lưu
        </Button>
      </DialogFooter>
    </div>
  )
}

export function BanHangHeaderFields({
  values,
  onChange,
  errors,
}: BanHangHeaderFieldsProps) {
  return (
    <section aria-labelledby="section-bh-info">
      <h2 id="section-bh-info" className="mb-4 text-base font-semibold">
        Thông tin khách hàng
      </h2>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Số phiếu">
          <Input value="Phát sinh tự động" readOnly disabled />
        </Field>

        <Field label="Ngày bán">
          <Input type="date" value={new Date().toISOString().slice(0, 10)} readOnly disabled />
        </Field>

        <Field
          label="Hình thức thanh toán"
          required
          error={errors.hinhThucThanhToan}
        >
          <Select
            value={values.hinhThucThanhToan}
            onValueChange={(v) => onChange({ hinhThucThanhToan: v })}
          >
            <SelectTrigger aria-label="Hình thức thanh toán">
              <SelectValue placeholder="Chọn hình thức" />
            </SelectTrigger>
            <SelectContent>
              {HINH_THUC_THANH_TOAN_OPTIONS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Khoản thu">
          <Input value="Thu bán hàng" readOnly disabled />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Khách hàng" required error={errors.khachHang}>
            <ServerAutocomplete
              value={values.khachHang}
              onChange={(opt) => onChange({ khachHang: opt as CustomerOption | null })}
              fetchOptions={searchKhachHang}
              placeholder="Nhập vào Tên / Số điện thoại"
              quickCreate={{
                title: 'Thêm khách hàng',
                renderForm: (close, select) => (
                  <QuickCreateCustomerForm close={close} select={select} />
                ),
              }}
            />
          </Field>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Ghi chú">
            <Textarea
              rows={2}
              value={values.ghiChu}
              onChange={(e) => onChange({ ghiChu: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </section>
  )
}

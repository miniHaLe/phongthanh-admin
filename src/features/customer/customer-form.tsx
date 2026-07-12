import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
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
import type { NganHang } from '@/domains/hr/types'
import type { KhachHang } from '@/types/masterdata-types'
import type {
  VietnamCommune,
  VietnamProvince,
} from '@/types/vietnam-administrative-types'
import { CustomerAddressFields } from './customer-address-fields'
import {
  customerToFormValues,
  toCustomerMutationPayload,
  validateCustomerForm,
  type CustomerFormErrors,
  type CustomerFormValues,
} from './customer-form-values'

interface CustomerFormProps {
  idPrefix: string
  initialCustomer?: KhachHang
  provinces: VietnamProvince[]
  communes: VietnamCommune[]
  banks: NganHang[]
  isPending?: boolean
  submitLabel?: string
  onCancel: () => void
  onSubmit: (
    data: ReturnType<typeof toCustomerMutationPayload>,
  ) => Promise<void> | void
}

export function CustomerForm({
  idPrefix,
  initialCustomer,
  provinces,
  communes,
  banks,
  isPending,
  submitLabel = 'Lưu',
  onCancel,
  onSubmit,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(() =>
    customerToFormValues(initialCustomer),
  )
  const [errors, setErrors] = useState<CustomerFormErrors>({})
  const [addressTouched, setAddressTouched] = useState(false)
  const inactiveInitialBank =
    initialCustomer?.nganHangId &&
    !banks.some((bank) => bank.id === initialCustomer.nganHangId)
      ? {
          id: initialCustomer.nganHangId,
          name:
            initialCustomer.nganHangTen ??
            `Ngân hàng ${initialCustomer.nganHangId}`,
        }
      : undefined

  useEffect(() => {
    setValues(customerToFormValues(initialCustomer))
    setErrors({})
    setAddressTouched(false)
  }, [initialCustomer])

  function patch(next: Partial<CustomerFormValues>) {
    if (
      ['tenDuong', 'tinhThanhCode', 'phuongXaCode'].some((key) =>
        Object.prototype.hasOwnProperty.call(next, key),
      )
    ) {
      setAddressTouched(true)
    }
    setValues((current) => ({ ...current, ...next }))
    setErrors((current) => {
      const copy = { ...current }
      for (const key of Object.keys(next) as Array<keyof CustomerFormValues>)
        delete copy[key]
      return copy
    })
  }

  function errorProps(key: keyof CustomerFormValues) {
    const error = errors[key]
    return {
      'aria-invalid': Boolean(error),
      'aria-describedby': error ? `${idPrefix}-${key}-error` : undefined,
    }
  }

  function ErrorMessage({ field }: { field: keyof CustomerFormValues }) {
    return errors[field] ? (
      <p id={`${idPrefix}-${field}-error`} className="text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null
  }

  async function handleSubmit() {
    const nextErrors = validateCustomerForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit(
      toCustomerMutationPayload(values, provinces, communes, {
        forUpdate: Boolean(initialCustomer),
        addressTouched,
      }),
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-name`}>
            Tên khách hàng <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-name`}
            value={values.tenKH}
            disabled={isPending}
            autoFocus
            autoComplete="name"
            aria-required="true"
            {...errorProps('tenKH')}
            onChange={(event) => patch({ tenKH: event.target.value })}
          />
          <ErrorMessage field="tenKH" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-phone`}>
            Điện thoại <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-phone`}
            value={values.dienThoai}
            disabled={isPending}
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            {...errorProps('dienThoai')}
            onChange={(event) => patch({ dienThoai: event.target.value })}
          />
          <ErrorMessage field="dienThoai" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-phone-2`}>Điện thoại 2</Label>
          <Input
            id={`${idPrefix}-phone-2`}
            value={values.dienThoai2}
            disabled={isPending}
            inputMode="tel"
            autoComplete="tel"
            onChange={(event) => patch({ dienThoai2: event.target.value })}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={values.email}
            disabled={isPending}
            autoComplete="email"
            {...errorProps('email')}
            onChange={(event) => patch({ email: event.target.value })}
          />
          <ErrorMessage field="email" />
        </div>

        <CustomerAddressFields
          idPrefix={idPrefix}
          values={values}
          provinces={provinces}
          communes={communes}
          disabled={isPending}
          errors={errors}
          patch={patch}
        />

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-tax-code`}>Mã số thuế</Label>
          <Input
            id={`${idPrefix}-tax-code`}
            value={values.maSoThue}
            disabled={isPending}
            inputMode="numeric"
            {...errorProps('maSoThue')}
            onChange={(event) => patch({ maSoThue: event.target.value })}
          />
          <ErrorMessage field="maSoThue" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-bank`}>Ngân hàng</Label>
          <Select
            value={values.nganHangId || '__none__'}
            disabled={isPending}
            onValueChange={(value) =>
              patch({ nganHangId: value === '__none__' ? '' : value })
            }
          >
            <SelectTrigger id={`${idPrefix}-bank`}>
              <SelectValue placeholder="Chọn ngân hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Chưa chọn</SelectItem>
              {inactiveInitialBank && (
                <SelectItem value={inactiveInitialBank.id}>
                  {inactiveInitialBank.name} — Ngừng hoạt động
                </SelectItem>
              )}
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.maNganHang} — {bank.tenNganHang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-account-number`}>Số tài khoản</Label>
          <Input
            id={`${idPrefix}-account-number`}
            value={values.soTaiKhoan}
            disabled={isPending}
            inputMode="numeric"
            autoComplete="off"
            onChange={(event) => patch({ soTaiKhoan: event.target.value })}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-note`}>Ghi chú</Label>
          <Textarea
            id={`${idPrefix}-note`}
            value={values.ghiChu}
            disabled={isPending}
            rows={2}
            onChange={(event) => patch({ ghiChu: event.target.value })}
          />
        </div>
      </div>

      <DialogFooter className="sticky bottom-0 border-t bg-background pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => void handleSubmit()}
        >
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )
}

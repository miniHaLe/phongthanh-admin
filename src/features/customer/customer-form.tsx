import { useEffect, useState, type FormEvent } from 'react'
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
  initialCustomerTypeId?: number
  customerTypeOptions?: Array<{ id: number; ten: string }>
  nameLabel?: string
  provinces: VietnamProvince[]
  communes: VietnamCommune[]
  banks: NganHang[]
  isPending?: boolean
  submitLabel?: string
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
  onSubmit: (
    data: ReturnType<typeof toCustomerMutationPayload>,
  ) => Promise<void> | void
}

export function CustomerForm({
  idPrefix,
  initialCustomer,
  initialCustomerTypeId,
  customerTypeOptions,
  nameLabel = 'Tên khách hàng',
  provinces,
  communes,
  banks,
  isPending,
  submitLabel = 'Lưu',
  onCancel,
  onDirtyChange,
  onSubmit,
}: CustomerFormProps) {
  const initialValues = () => ({
    ...customerToFormValues(initialCustomer),
    ...(!initialCustomer && initialCustomerTypeId
      ? { loaiKhachHangId: initialCustomerTypeId }
      : {}),
  })
  const [values, setValues] = useState<CustomerFormValues>(initialValues)
  const [baselineValues, setBaselineValues] =
    useState<CustomerFormValues>(initialValues)
  const [errors, setErrors] = useState<CustomerFormErrors>({})
  const [addressTouched, setAddressTouched] = useState(false)
  const [clearAddress, setClearAddress] = useState(false)
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
    const nextValues = initialValues()
    setValues(nextValues)
    setBaselineValues(nextValues)
    setErrors({})
    setAddressTouched(false)
    setClearAddress(false)
  }, [initialCustomer, initialCustomerTypeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty =
    addressTouched ||
    clearAddress ||
    JSON.stringify(values) !== JSON.stringify(baselineValues)

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(
    () => () => {
      onDirtyChange?.(false)
    },
    [onDirtyChange],
  )

  function patch(next: Partial<CustomerFormValues>) {
    if (
      ['tenDuong', 'tinhThanhCode', 'phuongXaCode'].some((key) =>
        Object.prototype.hasOwnProperty.call(next, key),
      )
    ) {
      setAddressTouched(true)
      setClearAddress(false)
    }
    setValues((current) => ({ ...current, ...next }))
    setErrors((current) => {
      const copy = { ...current }
      for (const key of Object.keys(next) as Array<keyof CustomerFormValues>)
        delete copy[key]
      return copy
    })
  }

  function handleClearAddress() {
    setAddressTouched(true)
    setClearAddress(true)
    setValues((current) => ({
      ...current,
      tenDuong: '',
      tinhThanhCode: '',
      phuongXaCode: '',
    }))
    setErrors((current) => {
      const copy = { ...current }
      delete copy.tenDuong
      delete copy.tinhThanhCode
      delete copy.phuongXaCode
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return
    const nextErrors = validateCustomerForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit(
      toCustomerMutationPayload(values, provinces, communes, {
        forUpdate: Boolean(initialCustomer),
        addressTouched,
        clearAddress,
      }),
    )
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-name`}>
            {nameLabel} <span className="text-destructive">*</span>
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
            {...errorProps('dienThoai2')}
            onChange={(event) => patch({ dienThoai2: event.target.value })}
          />
          <ErrorMessage field="dienThoai2" />
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

        {customerTypeOptions && customerTypeOptions.length > 0 && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-customer-type`}>
              Loại đại lý <span className="text-destructive">*</span>
            </Label>
            <Select
              value={String(values.loaiKhachHangId)}
              disabled={isPending}
              onValueChange={(value) =>
                patch({ loaiKhachHangId: Number(value) })
              }
            >
              <SelectTrigger id={`${idPrefix}-customer-type`}>
                <SelectValue placeholder="Chọn loại đại lý" />
              </SelectTrigger>
              <SelectContent>
                {customerTypeOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {initialCustomer?.diaChi && (
          <div className="space-y-2 rounded-md border bg-muted/30 p-3 sm:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Địa chỉ đang lưu
                </p>
                <p className="text-sm" aria-live="polite">
                  {clearAddress
                    ? 'Địa chỉ sẽ được xóa khi lưu.'
                    : initialCustomer.diaChi}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || clearAddress}
                onClick={handleClearAddress}
              >
                Xóa địa chỉ
              </Button>
            </div>
          </div>
        )}

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
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

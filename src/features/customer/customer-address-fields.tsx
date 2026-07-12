import { useState } from 'react'
import { announce } from '@/a11y/announce'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CustomerFormErrors,
  CustomerFormValues,
} from './customer-form-values'
import { CustomerCommuneCombobox } from './customer-commune-combobox'
import type {
  VietnamCommune,
  VietnamProvince,
} from '@/types/vietnam-administrative-types'
import {
  administrativeDisplayName,
  reconcileProvinceSelection,
} from './customer-form-values'

interface CustomerAddressFieldsProps {
  idPrefix: string
  values: CustomerFormValues
  provinces: VietnamProvince[]
  communes: VietnamCommune[]
  disabled?: boolean
  errors: CustomerFormErrors
  patch: (values: Partial<CustomerFormValues>) => void
}

export function CustomerAddressFields({
  idPrefix,
  values,
  provinces,
  communes,
  disabled,
  errors,
  patch,
}: CustomerAddressFieldsProps) {
  const [liveMessage, setLiveMessage] = useState('')

  function report(message: string) {
    setLiveMessage(message)
    announce(message)
  }

  function selectProvince(code: string) {
    const nextCode = code === '__none__' ? '' : code
    const reconciled = reconcileProvinceSelection(
      nextCode,
      values.phuongXaCode,
      communes,
    )
    patch({
      tinhThanhCode: reconciled.tinhThanhCode,
      phuongXaCode: reconciled.phuongXaCode,
    })
    if (reconciled.clearedCommune) {
      report('Đã xóa Phường/Xã vì không thuộc Tỉnh/Thành phố vừa chọn.')
    }
  }

  function selectCommune(commune: VietnamCommune) {
    patch({
      phuongXaCode: commune.code,
      tinhThanhCode: commune.provinceCode,
    })
    const province = provinces.find(
      (item) => item.code === commune.provinceCode,
    )
    if (province && province.code !== values.tinhThanhCode) {
      report(`Đã tự động chọn ${administrativeDisplayName(province)}.`)
    }
  }

  return (
    <>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-street`}>Tên đường</Label>
        <Input
          id={`${idPrefix}-street`}
          value={values.tenDuong}
          disabled={disabled}
          autoComplete="street-address"
          placeholder="Số nhà, tên đường"
          onChange={(event) => patch({ tenDuong: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-province`}>Tỉnh/Thành phố</Label>
        <Select
          value={values.tinhThanhCode || '__none__'}
          disabled={disabled}
          onValueChange={selectProvince}
        >
          <SelectTrigger
            id={`${idPrefix}-province`}
            aria-invalid={Boolean(errors.tinhThanhCode)}
            aria-describedby={
              errors.tinhThanhCode ? `${idPrefix}-province-error` : undefined
            }
          >
            <SelectValue placeholder="Chọn tỉnh/thành phố" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__none__">Chưa chọn</SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.code}>
                {administrativeDisplayName(province)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tinhThanhCode && (
          <p
            id={`${idPrefix}-province-error`}
            className="text-xs text-destructive"
          >
            {errors.tinhThanhCode}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-commune`}>Phường/Xã</Label>
        <CustomerCommuneCombobox
          id={`${idPrefix}-commune`}
          communes={communes}
          provinceCode={values.tinhThanhCode}
          value={values.phuongXaCode}
          disabled={disabled}
          invalid={Boolean(errors.phuongXaCode)}
          describedBy={
            errors.phuongXaCode
              ? `${idPrefix}-commune-error ${idPrefix}-address-status`
              : `${idPrefix}-address-status`
          }
          onClear={() => patch({ phuongXaCode: '' })}
          onSelect={selectCommune}
        />
        {errors.phuongXaCode && (
          <p
            id={`${idPrefix}-commune-error`}
            className="text-xs text-destructive"
          >
            {errors.phuongXaCode}
          </p>
        )}
      </div>

      <p
        id={`${idPrefix}-address-status`}
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        {liveMessage}
      </p>
    </>
  )
}

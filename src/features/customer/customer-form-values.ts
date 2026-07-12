import type { KhachHang } from '@/types/masterdata-types'
import type {
  VietnamCommune,
  VietnamProvince,
} from '@/types/vietnam-administrative-types'

export interface CustomerFormValues {
  tenKH: string
  dienThoai: string
  dienThoai2: string
  email: string
  tenDuong: string
  tinhThanhCode: string
  phuongXaCode: string
  maSoThue: string
  nganHangId: string
  soTaiKhoan: string
  ghiChu: string
  loaiKhachHangId: number
}

export type CustomerFormErrors = Partial<
  Record<keyof CustomerFormValues, string>
>

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  tenKH: '',
  dienThoai: '',
  dienThoai2: '',
  email: '',
  tenDuong: '',
  tinhThanhCode: '',
  phuongXaCode: '',
  maSoThue: '',
  nganHangId: '',
  soTaiKhoan: '',
  ghiChu: '',
  loaiKhachHangId: 1,
}

export function administrativeDisplayName(item?: { name: string }): string {
  return item?.name.trim() ?? ''
}

export function customerToFormValues(customer?: KhachHang): CustomerFormValues {
  if (!customer) return EMPTY_CUSTOMER_FORM
  return {
    tenKH: customer.tenKH ?? '',
    dienThoai: customer.dienThoai ?? '',
    dienThoai2: customer.dienThoai2 ?? '',
    email: customer.email ?? '',
    tenDuong: customer.tenDuong ?? '',
    tinhThanhCode: customer.tinhThanhCode ?? '',
    phuongXaCode: customer.phuongXaCode ?? '',
    maSoThue: customer.maSoThue ?? '',
    nganHangId: customer.nganHangId ?? '',
    soTaiKhoan: customer.soTaiKhoan ?? '',
    ghiChu: customer.ghiChu ?? '',
    loaiKhachHangId: customer.loaiKhachHangId ?? 1,
  }
}

export function validateCustomerForm(
  values: CustomerFormValues,
): CustomerFormErrors {
  const errors: CustomerFormErrors = {}
  if (!values.tenKH.trim()) errors.tenKH = 'Tên khách hàng là bắt buộc'
  if (!values.dienThoai.trim()) errors.dienThoai = 'Điện thoại là bắt buộc'
  if (values.email.trim() && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = 'Email không hợp lệ'
  }
  const tax = values.maSoThue.trim()
  if (tax && !/^(?:\d{10}|\d{10}-\d{3})$/.test(tax)) {
    errors.maSoThue = 'Mã số thuế phải có dạng 10 số hoặc 10 số-3 số'
  }
  if (values.tinhThanhCode && !values.phuongXaCode) {
    errors.phuongXaCode = 'Vui lòng chọn Phường/Xã thuộc Tỉnh/Thành phố'
  }
  if (values.phuongXaCode && !values.tinhThanhCode) {
    errors.tinhThanhCode = 'Vui lòng chọn Tỉnh/Thành phố của Phường/Xã'
  }
  return errors
}

export function composeCustomerAddress(
  street: string,
  commune?: VietnamCommune,
  province?: VietnamProvince,
): string {
  return [
    street.trim(),
    administrativeDisplayName(commune),
    administrativeDisplayName(province),
  ]
    .filter(Boolean)
    .join(', ')
}

export function reconcileProvinceSelection(
  provinceCode: string,
  communeCode: string,
  communes: VietnamCommune[],
): { tinhThanhCode: string; phuongXaCode: string; clearedCommune: boolean } {
  const commune = communes.find((item) => item.code === communeCode)
  const incompatible = Boolean(commune && commune.provinceCode !== provinceCode)
  return {
    tinhThanhCode: provinceCode,
    phuongXaCode: incompatible ? '' : communeCode,
    clearedCommune: incompatible,
  }
}

export function toCustomerMutationPayload(
  values: CustomerFormValues,
  provinces: VietnamProvince[],
  communes: VietnamCommune[],
  options: { forUpdate?: boolean; addressTouched?: boolean } = {},
) {
  const province = provinces.find((item) => item.code === values.tinhThanhCode)
  const commune = communes.find((item) => item.code === values.phuongXaCode)
  const optional = (value: string) =>
    value.trim() || (options.forUpdate ? null : undefined)
  const writeAddress = !options.forUpdate || options.addressTouched
  const composedAddress = composeCustomerAddress(
    values.tenDuong,
    commune,
    province,
  )

  return {
    tenKH: values.tenKH.trim(),
    dienThoai: values.dienThoai.trim(),
    dienThoai2: optional(values.dienThoai2),
    email: optional(values.email),
    ...(writeAddress
      ? {
          tenDuong: optional(values.tenDuong),
          tinhThanhCode:
            values.tinhThanhCode || (options.forUpdate ? null : undefined),
          phuongXaCode:
            values.phuongXaCode || (options.forUpdate ? null : undefined),
          diaChi: composedAddress || (options.forUpdate ? null : undefined),
        }
      : {}),
    maSoThue: optional(values.maSoThue),
    nganHangId: values.nganHangId || (options.forUpdate ? null : undefined),
    soTaiKhoan: optional(values.soTaiKhoan),
    ghiChu: optional(values.ghiChu),
    loaiKhachHangId: values.loaiKhachHangId,
  }
}

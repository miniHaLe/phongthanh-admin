import { describe, expect, it } from 'vitest'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'
import {
  EMPTY_CUSTOMER_FORM,
  composeCustomerAddress,
  customerToFormValues,
  reconcileProvinceSelection,
  toCustomerMutationPayload,
  validateCustomerForm,
} from './customer-form-values'
import { findUniqueExactCommune } from './customer-commune-search'

const geography: VietnamAdministrativeSnapshot = {
  version: 'test',
  effectiveFrom: '2025-07-01',
  sourceDocument: 'test',
  provinces: [
    { code: '01', name: 'Thành phố Hà Nội', type: 'city' },
    { code: '48', name: 'Thành phố Đà Nẵng', type: 'city' },
  ],
  communes: [
    {
      code: '00001',
      name: 'Phường Hoàn Kiếm',
      type: 'ward',
      normalizedName: 'hoan kiem',
      provinceCode: '01',
      provinceName: 'Thành phố Hà Nội',
    },
    {
      code: '00002',
      name: 'Phường Hòa Khánh',
      type: 'ward',
      normalizedName: 'hoa khanh',
      provinceCode: '48',
      provinceName: 'Thành phố Đà Nẵng',
    },
    {
      code: '00003',
      name: 'Phường Hòa Khánh',
      type: 'ward',
      normalizedName: 'hoa khanh',
      provinceCode: '01',
      provinceName: 'Thành phố Hà Nội',
    },
  ],
}

describe('customer form contract', () => {
  it('accepts blank finance, 10 digit tax, and branch tax codes', () => {
    expect(
      validateCustomerForm({
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
      }),
    ).toEqual({})
    expect(
      validateCustomerForm({
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
        maSoThue: '0123456789',
      }),
    ).toEqual({})
    expect(
      validateCustomerForm({
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
        maSoThue: '0123456789-001',
      }),
    ).toEqual({})
    expect(
      validateCustomerForm({
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
        maSoThue: '123',
      }).maSoThue,
    ).toBeTruthy()
  })

  it('rejects malformed primary and secondary phone numbers', () => {
    expect(
      validateCustomerForm({
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: 'abc',
      }).dienThoai,
    ).toBeTruthy()
    expect(
      validateCustomerForm({
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
        dienThoai2: '123',
      }).dienThoai2,
    ).toBeTruthy()
  })

  it('keeps official address codes, composed compatibility address, and leading zeroes', () => {
    const payload = toCustomerMutationPayload(
      {
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
        tenDuong: '12 Trần Phú',
        tinhThanhCode: '01',
        phuongXaCode: '00001',
        soTaiKhoan: '00123456789',
      },
      geography.provinces,
      geography.communes,
    )
    expect(payload).toMatchObject({
      tinhThanhCode: '01',
      phuongXaCode: '00001',
      soTaiKhoan: '00123456789',
      diaChi: '12 Trần Phú, Phường Hoàn Kiếm, Thành phố Hà Nội',
    })
    expect(
      composeCustomerAddress('', geography.communes[0], geography.provinces[0]),
    ).toBe('Phường Hoàn Kiếm, Thành phố Hà Nội')
  })

  it('requires province and commune as a compatible pair when either is selected', () => {
    expect(
      validateCustomerForm({
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
        tinhThanhCode: '01',
      }).phuongXaCode,
    ).toBeTruthy()
  })

  it('infers only a globally unique exact commune name', () => {
    expect(findUniqueExactCommune('Hoàn Kiếm', geography.communes)?.code).toBe(
      '00001',
    )
    expect(
      findUniqueExactCommune('Hòa Khánh', geography.communes),
    ).toBeUndefined()
  })

  it('filters by province contract and clears an incompatible commune', () => {
    expect(
      reconcileProvinceSelection('48', '00001', geography.communes),
    ).toEqual({
      tinhThanhCode: '48',
      phuongXaCode: '',
      clearedCommune: true,
    })
    expect(
      reconcileProvinceSelection('01', '00001', geography.communes),
    ).toEqual({
      tinhThanhCode: '01',
      phuongXaCode: '00001',
      clearedCommune: false,
    })
    expect(reconcileProvinceSelection('', '00001', geography.communes)).toEqual(
      {
        tinhThanhCode: '',
        phuongXaCode: '',
        clearedCommune: true,
      },
    )
  })

  it('preserves the existing customer group and clears optional edit fields explicitly', () => {
    const values = customerToFormValues({
      id: 'kh-dealer',
      tenKH: 'Đại lý A',
      dienThoai: '0905000000',
      loaiKhachHangId: 4,
      nguoiTao: 'admin',
      active: true,
      createdAt: '2026-07-01T00:00:00.000Z',
      email: 'old@example.com',
      maSoThue: '0123456789',
      nganHangId: 'bank-1',
      soTaiKhoan: '00123',
    })
    values.email = ''
    values.maSoThue = ''
    values.nganHangId = ''
    values.soTaiKhoan = ''

    const payload = toCustomerMutationPayload(
      values,
      geography.provinces,
      geography.communes,
      { forUpdate: true, addressTouched: false },
    )
    expect(payload).toMatchObject({
      loaiKhachHangId: 4,
      email: null,
      maSoThue: null,
      nganHangId: null,
      soTaiKhoan: null,
    })
    expect(payload).not.toHaveProperty('tenDuong')
    expect(payload).not.toHaveProperty('diaChi')
  })

  it('preserves a legacy compatibility address when normalized fields are only touched', () => {
    const payload = toCustomerMutationPayload(
      {
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
      },
      geography.provinces,
      geography.communes,
      { forUpdate: true, addressTouched: true },
    )
    expect(payload).toMatchObject({
      tenDuong: null,
      tinhThanhCode: null,
      phuongXaCode: null,
    })
    expect(payload).not.toHaveProperty('diaChi')
    expect(payload).not.toHaveProperty('clearDiaChi')
  })

  it('sends the explicit clear marker only from the clear-address action', () => {
    const payload = toCustomerMutationPayload(
      {
        ...EMPTY_CUSTOMER_FORM,
        tenKH: 'Nguyễn Văn A',
        dienThoai: '0905000000',
      },
      geography.provinces,
      geography.communes,
      { forUpdate: true, addressTouched: true, clearAddress: true },
    )
    expect(payload).toMatchObject({
      tenDuong: null,
      tinhThanhCode: null,
      phuongXaCode: null,
      diaChi: null,
      clearDiaChi: true,
    })
  })
})

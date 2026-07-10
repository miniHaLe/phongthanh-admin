/** Spec: Ngân Hàng — exact column headers + side-form fields (section-hr.md H1). */
import { describe, it, expect } from 'vitest'
import { nganHangConfig } from './ngan-hang.config'

describe('nganHangConfig', () => {
  it('exposes the exact verified column headers', () => {
    expect(nganHangConfig.columns.map((c) => c.header)).toEqual([
      'Mã Ngân Hàng',
      'Tên Ngân Hàng',
      'Địa chỉ',
    ])
  })

  it('requires Mã Ngân Hàng, Tên Ngân Hàng; Địa chỉ is a textarea', () => {
    const byKey = Object.fromEntries(
      nganHangConfig.fields.map((f) => [String(f.key), f]),
    )
    expect(byKey.maNganHang.required).toBe(true)
    expect(byKey.tenNganHang.required).toBe(true)
    expect(byKey.diaChi.type).toBe('textarea')
  })

  it('opts into bulk-delete + Lưu & Thêm mới', () => {
    expect(nganHangConfig.bulkDelete).toBe(true)
    expect(nganHangConfig.saveAndNew).toBe(true)
  })
})

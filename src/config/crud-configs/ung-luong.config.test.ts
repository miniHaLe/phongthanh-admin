/** Spec: Ứng Lương — exact columns + NV/Kỳ selects (section-hr.md H4). */
import { describe, it, expect } from 'vitest'
import { ungLuongConfig } from './ung-luong.config'

describe('ungLuongConfig', () => {
  it('exposes the exact verified column headers', () => {
    expect(ungLuongConfig.columns.map((c) => c.header)).toEqual([
      'Tên Nhân Viên',
      'Tên Kỳ',
      'Ngày Ứng',
      'Số Tiền',
      'Ghi chú',
    ])
  })

  it('has a Kỳ filter and an NV filter', () => {
    const keys = ungLuongConfig.filters?.map((f) => String(f.key))
    expect(keys).toEqual(['nhanVienId', 'kyId'])
  })

  it('form fields: nhân viên + kỳ selects, ngày ứng date, số tiền money', () => {
    const byKey = Object.fromEntries(
      ungLuongConfig.fields.map((f) => [String(f.key), f]),
    )
    expect(byKey.nhanVienId.type).toBe('select')
    expect(byKey.nhanVienId.required).toBe(true)
    expect(byKey.kyId.type).toBe('select')
    expect(byKey.kyId.required).toBe(true)
    expect(byKey.ngayUng.type).toBe('date')
    expect(byKey.soTien.type).toBe('money')
  })

  it('opts into bulk-delete + Lưu & Thêm mới', () => {
    expect(ungLuongConfig.bulkDelete).toBe(true)
    expect(ungLuongConfig.saveAndNew).toBe(true)
  })
})

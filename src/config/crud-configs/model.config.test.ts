import { describe, it, expect } from 'vitest'
import { modelConfig } from './model.config'

describe('modelConfig', () => {
  it('renders the exact verified column header order', () => {
    expect(modelConfig.columns.map((c) => c.header)).toEqual([
      'Tên model',
      'Model Code',
      'Nhà sản xuất',
      'Sản phẩm',
      'Người tạo',
      'Ngày tạo',
      'Ghi chú',
    ])
  })

  it('opts into bulk-delete, save-and-new, and export', () => {
    expect(modelConfig.bulkDelete).toBe(true)
    expect(modelConfig.saveAndNew).toBe(true)
    expect(modelConfig.export).toBe(true)
  })

  it('exposes exactly the four approved editable fields', () => {
    expect(modelConfig.fields.map((field) => field.label)).toEqual([
      'Tên Sản Phẩm',
      'Nhà sản xuất',
      'Tên model',
      'Ghi chú',
    ])

    const byKey = Object.fromEntries(modelConfig.fields.map((f) => [f.key, f]))
    expect(byKey.sanPhamId?.required).toBe(true)
    expect(byKey.nhaSanXuatId?.required).toBe(true)
    expect(byKey.tenModel?.required).toBe(true)
    expect(byKey.maModel).toBeUndefined()
  })
})

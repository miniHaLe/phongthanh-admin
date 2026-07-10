import { describe, it, expect } from 'vitest'
import { thoiHanConfig } from './thoi-han.config'

describe('thoiHanConfig', () => {
  it('renders the exact verified column header order', () => {
    expect(thoiHanConfig.columns.map((c) => c.header)).toEqual([
      'Tên',
      'Loại',
      'Thời Gian Bảo Hành',
    ])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(thoiHanConfig.bulkDelete).toBe(true)
    expect(thoiHanConfig.saveAndNew).toBe(true)
  })

  it('has a Loại radio field with exactly Tháng/Năm options', () => {
    const field = thoiHanConfig.fields.find((f) => f.key === 'loai')
    expect(field?.type).toBe('radio')
    expect(field?.options?.map((o) => o.label)).toEqual(['Tháng', 'Năm'])
  })
})

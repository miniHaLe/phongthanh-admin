import { describe, it, expect } from 'vitest'
import { loiSuaChuaConfig } from './loi-sua-chua.config'

describe('loiSuaChuaConfig', () => {
  it('renders the exact verified labor-price column header order', () => {
    expect(loiSuaChuaConfig.columns.map((c) => c.header)).toEqual([
      'Chi Nhánh',
      'Tên Nhóm Sản Phẩm',
      'Tên Lỗi Sửa Chữa',
      'Tiền Công',
      'Tiền Công DV',
    ])
  })

  it('Chi nhánh options include all 3 branches', () => {
    const field = loiSuaChuaConfig.fields.find((f) => f.key === 'branchId')
    expect(field?.options).toHaveLength(3)
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(loiSuaChuaConfig.bulkDelete).toBe(true)
    expect(loiSuaChuaConfig.saveAndNew).toBe(true)
  })
})

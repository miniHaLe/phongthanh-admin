import { describe, it, expect } from 'vitest'
import { nhomHangHoaConfig } from './nhom-hang-hoa.config'

describe('nhomHangHoaConfig', () => {
  it('renders the exact verified column header order', () => {
    expect(nhomHangHoaConfig.columns.map((c) => c.header)).toEqual([
      'Mã nhóm hàng hóa',
      'Tên nhóm hàng hóa',
    ])
  })

  it('opts into bulk-delete and save-and-new; Mã nhóm is optional', () => {
    expect(nhomHangHoaConfig.bulkDelete).toBe(true)
    expect(nhomHangHoaConfig.saveAndNew).toBe(true)
    const ma = nhomHangHoaConfig.fields.find((f) => f.key === 'maNhom')
    expect(ma?.required).toBeFalsy()
  })
})

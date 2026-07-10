import { describe, it, expect } from 'vitest'
import { nhaSanXuatConfig } from './nha-san-xuat.config'

describe('nhaSanXuatConfig', () => {
  it('renders the exact verified column header order (Ghi chú, no Nước SX)', () => {
    expect(nhaSanXuatConfig.columns.map((c) => c.header)).toEqual([
      'Mã nhà sản xuất',
      'Tên nhà sản xuất',
      'Ghi chú',
    ])
  })

  it('opts into bulk-delete and save-and-new; Mã NSX is optional', () => {
    expect(nhaSanXuatConfig.bulkDelete).toBe(true)
    expect(nhaSanXuatConfig.saveAndNew).toBe(true)
    const ma = nhaSanXuatConfig.fields.find((f) => f.key === 'maNSX')
    expect(ma?.required).toBeFalsy()
  })
})

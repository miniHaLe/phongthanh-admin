import { describe, it, expect } from 'vitest'
import { nhomSanPhamConfig } from './nhom-san-pham.config'

describe('nhomSanPhamConfig', () => {
  it('renders the single verified column', () => {
    expect(nhomSanPhamConfig.columns.map((c) => c.header)).toEqual(['Tên Nhóm'])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(nhomSanPhamConfig.bulkDelete).toBe(true)
    expect(nhomSanPhamConfig.saveAndNew).toBe(true)
  })
})

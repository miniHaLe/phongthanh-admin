import { describe, it, expect } from 'vitest'
import { sanPhamConfig } from './san-pham.config'

describe('sanPhamConfig', () => {
  it('renders the exact verified column header order incl. Tiền khoán', () => {
    expect(sanPhamConfig.columns.map((c) => c.header)).toEqual([
      'Tên sản phẩm',
      'Mã sản phẩm',
      'Nhóm sản phẩm',
      'Tiền khoán',
    ])
  })

  it('has no Nhà sản xuất field (removed per reference)', () => {
    expect(
      sanPhamConfig.fields.some((f) => String(f.key) === 'nhaSanXuatId'),
    ).toBe(false)
  })

  it('opts into bulk-delete and save-and-new; Tiền khoán is a money field', () => {
    expect(sanPhamConfig.bulkDelete).toBe(true)
    expect(sanPhamConfig.saveAndNew).toBe(true)
    const field = sanPhamConfig.fields.find((f) => f.key === 'tienKhoan')
    expect(field?.type).toBe('money')
  })
})

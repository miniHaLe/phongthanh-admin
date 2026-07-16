import { describe, it, expect } from 'vitest'
import { hangHoaConfig } from './hang-hoa.config'

describe('hangHoaConfig', () => {
  it('renders the exact verified 13 data-column header order (no invented giá/tồn/Trạng thái)', () => {
    expect(hangHoaConfig.columns.map((c) => c.header)).toEqual([
      'Hình',
      'Mã hàng',
      'Mã hàng phụ',
      'Tên hàng',
      'Tiếng Anh',
      'Nhóm hàng hóa',
      'Nhà sản xuất',
      'Tên model',
      'Model dùng chung',
      'Đơn vị',
      'Người tạo',
      'Ngày tạo',
      'Serial',
    ])
  })

  it('opts into bulk-delete + export and hides the generic Thêm button (full-page editor owns create)', () => {
    expect(hangHoaConfig.bulkDelete).toBe(true)
    expect(hangHoaConfig.export).toBe(true)
    expect(hangHoaConfig.addLabel).toBe(false)
  })

  it('demotes only the sparse Model-dùng-chung column below the 1366px fold', () => {
    const hidden = hangHoaConfig.columns
      .filter((c) => c.hidden)
      .map((c) => c.key)
    expect(hidden).toEqual(['modelDungChungText'])
  })

  it('keeps the Phase-2 restored plain-accessor columns visible by default', () => {
    const byKey = Object.fromEntries(
      hangHoaConfig.columns.map((c) => [c.key, c]),
    )
    for (const key of ['maHH', 'maHHPhu', 'tenHH', 'tenTiengAnh', 'nguoiTao']) {
      expect(byKey[key]?.hidden).toBeFalsy()
    }
  })

  it('the 3 price tiers are money fields for the full-page editor', () => {
    const byKey = Object.fromEntries(hangHoaConfig.fields.map((f) => [f.key, f]))
    expect(byKey.giaMua?.type).toBe('money')
    expect(byKey.giaBanSi?.type).toBe('money')
    expect(byKey.giaBanLe?.type).toBe('money')
  })
})

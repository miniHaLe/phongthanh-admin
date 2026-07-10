/** Spec: Phòng Ban — exact columns, no invented Trạng thái (section-hr.md H5). */
import { describe, it, expect } from 'vitest'
import { phongBanConfig } from './phong-ban.config'

describe('phongBanConfig', () => {
  it('exposes the exact verified column headers (no Trạng thái)', () => {
    expect(phongBanConfig.columns.map((c) => c.header)).toEqual([
      'Mã Phòng Ban',
      'Tên Phòng Ban',
    ])
  })

  it('opts into bulk-delete + Lưu & Thêm mới', () => {
    expect(phongBanConfig.bulkDelete).toBe(true)
    expect(phongBanConfig.saveAndNew).toBe(true)
  })

  it('has no active/switch field', () => {
    expect(phongBanConfig.fields.some((f) => f.type === 'switch')).toBe(false)
  })
})

/** Spec: Chi Nhánh admin list columns + form fields (section-admin-perm-account). */
import { describe, it, expect } from 'vitest'
import { chiNhanhConfig } from './chi-nhanh.config'

describe('chiNhanhConfig', () => {
  it('renders the reference column set (no invented Mã CN / Tỉnh thành / Trạng thái)', () => {
    expect(chiNhanhConfig.columns.map((c) => c.header)).toEqual([
      'Chi nhánh',
      'Điện thoại',
      'Hotline',
      'Người liên hệ',
      'Email',
      'Địa chỉ',
      'Chính',
      'Chuyển CN',
    ])
  })

  it('has a Toạ độ form field and opts into bulk delete', () => {
    expect(chiNhanhConfig.fields.some((f) => f.key === 'toaDo')).toBe(true)
    expect(chiNhanhConfig.bulkDelete).toBe(true)
    expect(chiNhanhConfig.saveAndNew).toBe(true)
  })
})

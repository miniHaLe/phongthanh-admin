/** Spec: Người Dùng admin list columns + Khóa toggle (section-admin-perm-account). */
import { describe, it, expect } from 'vitest'
import { nguoiDungConfig } from './nguoi-dung.config'

describe('nguoiDungConfig', () => {
  it('renders the reference column set with Khóa, no Trạng thái', () => {
    expect(nguoiDungConfig.columns.map((c) => c.header)).toEqual([
      'Chi nhánh',
      'Tên đăng nhập',
      'Tên đầy đủ',
      'Điện thoại',
      'Email',
      'Quyền',
      'Khóa',
    ])
  })

  it('opts into bulk delete + a "Thêm người dùng" add label', () => {
    expect(nguoiDungConfig.bulkDelete).toBe(true)
    expect(nguoiDungConfig.addLabel).toBe('Thêm người dùng')
  })

  it('keeps password create-only for the real API contract', () => {
    const password = nguoiDungConfig.fields.find(
      (field) => field.key === 'password',
    )
    expect(password).toEqual(
      expect.objectContaining({ required: true, createOnly: true }),
    )
  })
})

/** Spec: Chức Vụ — exact columns, no invented moTa/active (section-hr.md H6). */
import { describe, it, expect } from 'vitest'
import { chucVuConfig } from './chuc-vu.config'

describe('chucVuConfig', () => {
  it('exposes the exact verified column headers', () => {
    expect(chucVuConfig.columns.map((c) => c.header)).toEqual([
      'Mã Chức Vụ',
      'Tên Chức Vụ',
    ])
  })

  it('opts into bulk-delete', () => {
    expect(chucVuConfig.bulkDelete).toBe(true)
  })

  it('has no moTa or active field', () => {
    const keys = chucVuConfig.fields.map((f) => String(f.key))
    expect(keys).not.toContain('moTa')
    expect(keys).not.toContain('active')
  })
})

import { describe, it, expect } from 'vitest'
import { khuVucConfig } from './khu-vuc.config'

describe('khuVucConfig', () => {
  it('renders the 2-level Tỉnh→Phường/Xã column header order (no Quận)', () => {
    expect(khuVucConfig.columns.map((c) => c.header)).toEqual([
      'Tên Tỉnh',
      'Tên Phường/Xã',
      'Tên khu vực',
      'Cây số',
      'Tiền công',
      'Tiền công 2',
    ])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(khuVucConfig.bulkDelete).toBe(true)
    expect(khuVucConfig.saveAndNew).toBe(true)
  })

  it('requires Tỉnh, Phường/Xã and Tên khu vực; drops Quận entirely', () => {
    const byKey = Object.fromEntries(khuVucConfig.fields.map((f) => [f.key, f]))
    expect(byKey.tinhCode?.required).toBe(true)
    expect(byKey.phuongXaCode?.required).toBe(true)
    expect(byKey.tenKhuVuc?.required).toBe(true)
    expect(byKey.quanId).toBeUndefined()
    expect(byKey.tinhId).toBeUndefined()
    expect(byKey.xaId).toBeUndefined()
  })

  it('has no Quận column or filter', () => {
    expect(khuVucConfig.columns.some((c) => c.header === 'Tên Quận')).toBe(false)
    expect(
      (khuVucConfig.filters ?? []).some((f) => String(f.key) === 'quanId'),
    ).toBe(false)
  })
})

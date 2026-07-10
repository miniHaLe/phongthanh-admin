import { describe, it, expect } from 'vitest'
import { khuVucConfig } from './khu-vuc.config'

describe('khuVucConfig', () => {
  it('renders the exact verified Tỉnh→Quận→Xã hierarchy column header order', () => {
    expect(khuVucConfig.columns.map((c) => c.header)).toEqual([
      'Tên Tỉnh',
      'Tên Quận',
      'Tên Xã/Phường',
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

  it('requires Tỉnh, Quận, Tên khu vực but not Phường/Xã', () => {
    const byKey = Object.fromEntries(khuVucConfig.fields.map((f) => [f.key, f]))
    expect(byKey.tinhId?.required).toBe(true)
    expect(byKey.quanId?.required).toBe(true)
    expect(byKey.tenKhuVuc?.required).toBe(true)
    expect(byKey.xaId?.required).toBeFalsy()
  })
})

import { describe, it, expect } from 'vitest'
import { phuongXaConfig } from './phuong-xa.config'

describe('phuongXaConfig', () => {
  it('renders the exact verified column header order', () => {
    expect(phuongXaConfig.columns.map((c) => c.header)).toEqual([
      'Tên Tỉnh',
      'Tên Quận',
      'Tên Xã/Phường',
      'Cây số',
      'Tiền công',
      'Tuyến',
    ])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(phuongXaConfig.bulkDelete).toBe(true)
    expect(phuongXaConfig.saveAndNew).toBe(true)
  })

  it('requires Tỉnh, Quận, Tên phường xã but not Tuyến', () => {
    const byKey = Object.fromEntries(
      phuongXaConfig.fields.map((f) => [f.key, f]),
    )
    expect(byKey.tinhId?.required).toBe(true)
    expect(byKey.quanId?.required).toBe(true)
    expect(byKey.tenPhuongXa?.required).toBe(true)
    expect(byKey.tuyenId?.required).toBeFalsy()
  })
})

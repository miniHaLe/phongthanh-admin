import { describe, it, expect } from 'vitest'
import { nganChuaConfig } from './ngan-chua.config'

describe('nganChuaConfig', () => {
  it('renders Nhà kho before Tên ngăn chứa (reference column order)', () => {
    expect(nganChuaConfig.columns.map((c) => c.header)).toEqual([
      'Nhà kho',
      'Tên ngăn chứa',
    ])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(nganChuaConfig.bulkDelete).toBe(true)
    expect(nganChuaConfig.saveAndNew).toBe(true)
  })
})

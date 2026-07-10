import { describe, it, expect } from 'vitest'
import { donViTinhConfig } from './don-vi-tinh.config'

describe('donViTinhConfig', () => {
  it('renders the single verified column', () => {
    expect(donViTinhConfig.columns.map((c) => c.header)).toEqual([
      'Tên Đơn Vị Tính',
    ])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(donViTinhConfig.bulkDelete).toBe(true)
    expect(donViTinhConfig.saveAndNew).toBe(true)
  })
})

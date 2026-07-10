import { describe, it, expect } from 'vitest'
import { nhaKhoConfig } from './nha-kho.config'

describe('nhaKhoConfig', () => {
  it('renders the exact verified column header order incl. Kho xác', () => {
    expect(nhaKhoConfig.columns.map((c) => c.header)).toEqual([
      'Tên nhà kho',
      'Địa chỉ',
      'Chi nhánh',
      'Kho xác',
    ])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(nhaKhoConfig.bulkDelete).toBe(true)
    expect(nhaKhoConfig.saveAndNew).toBe(true)
  })

  it('has a Kho xác switch field on the form', () => {
    const field = nhaKhoConfig.fields.find((f) => f.key === 'khoXac')
    expect(field?.type).toBe('switch')
  })
})

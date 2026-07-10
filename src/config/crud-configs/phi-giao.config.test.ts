import { describe, it, expect } from 'vitest'
import { phiGiaoConfig } from './phi-giao.config'

describe('phiGiaoConfig', () => {
  it('renders the exact verified column header order (Sản phẩm-linked, not Khu vực)', () => {
    expect(phiGiaoConfig.columns.map((c) => c.header)).toEqual([
      'Sản phẩm',
      'Tên phí',
      'Số tiền',
      'Loại phí',
      'Ghi chú',
    ])
  })

  it('Loại phí options are exactly Cộng/Trừ/Công', () => {
    const field = phiGiaoConfig.fields.find((f) => f.key === 'loaiPhi')
    expect(field?.options?.map((o) => o.label)).toEqual(['Cộng', 'Trừ', 'Công'])
  })

  it('opts into bulk-delete and save-and-new', () => {
    expect(phiGiaoConfig.bulkDelete).toBe(true)
    expect(phiGiaoConfig.saveAndNew).toBe(true)
  })
})

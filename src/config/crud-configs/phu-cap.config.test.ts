/** Spec: Phụ Cấp — exact column headers + Loại radio options (section-hr.md H2). */
import { describe, it, expect } from 'vitest'
import { phuCapConfig } from './phu-cap.config'

describe('phuCapConfig', () => {
  it('exposes the exact verified column headers', () => {
    expect(phuCapConfig.columns.map((c) => c.header)).toEqual([
      'Tên phụ cấp',
      'Loại phụ cấp',
      'GiaTri',
    ])
  })

  it('Loại field is a radio with Ăn Chia / Tiền mặt options', () => {
    const loai = phuCapConfig.fields.find((f) => f.key === 'loaiPhuCap')!
    expect(loai.type).toBe('radio')
    expect(loai.options?.map((o) => o.label)).toEqual(['Ăn Chia', 'Tiền mặt'])
    expect(loai.required).toBe(true)
  })

  it('Giá Trị field is money and required', () => {
    const giaTri = phuCapConfig.fields.find((f) => f.key === 'giaTri')!
    expect(giaTri.type).toBe('money')
    expect(giaTri.required).toBe(true)
  })

  it('renders GiaTri column as VND', () => {
    const col = phuCapConfig.columns.find((c) => c.key === 'giaTri')!
    expect(col.renderCell?.(500_000 as never, {} as never)).toBe('500.000 ₫')
  })
})

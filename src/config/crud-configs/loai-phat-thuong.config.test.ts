/** Spec: Loại Phạt Thưởng — exact columns + Loại radio (section-hr.md H3). */
import { describe, it, expect } from 'vitest'
import { loaiPhatThuongConfig } from './loai-phat-thuong.config'

describe('loaiPhatThuongConfig', () => {
  it('exposes the exact verified column headers', () => {
    expect(loaiPhatThuongConfig.columns.map((c) => c.header)).toEqual([
      'Loại',
      'Tên Loại',
    ])
  })

  it('Loại field is a radio with Thưởng / Phạt options', () => {
    const loai = loaiPhatThuongConfig.fields.find((f) => f.key === 'loai')!
    expect(loai.type).toBe('radio')
    expect(loai.options?.map((o) => o.value)).toEqual(['Thưởng', 'Phạt'])
    expect(loai.required).toBe(true)
  })

  it('Tên Loại is required text', () => {
    const tenLoai = loaiPhatThuongConfig.fields.find(
      (f) => f.key === 'tenLoai',
    )!
    expect(tenLoai.type).toBe('text')
    expect(tenLoai.required).toBe(true)
  })
})

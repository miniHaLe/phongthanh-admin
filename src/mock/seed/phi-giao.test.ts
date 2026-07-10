/** Spec: Phí giao 3-value Loại phí + Sản phẩm linkage (section-catalog-b). */
import { describe, it, expect } from 'vitest'
import { LOAI_PHI, PHI_GIAO } from './phi-giao'
import { SAN_PHAM } from './reference-data'

describe('LOAI_PHI', () => {
  it('deep-equals the 3 pairs verbatim', () => {
    expect(LOAI_PHI).toEqual([
      { id: 1, ten: 'Cộng' },
      { id: 2, ten: 'Trừ' },
      { id: 3, ten: 'Công' },
    ])
  })
})

describe('PHI_GIAO rows', () => {
  const sanPhamIds = new Set(SAN_PHAM.map((s) => s.id))

  it('every sanPhamId resolves into SAN_PHAM or is null, with core fields present', () => {
    for (const r of PHI_GIAO) {
      if (r.sanPhamId !== null) expect(sanPhamIds.has(r.sanPhamId)).toBe(true)
      expect(r.tenPhi.length).toBeGreaterThan(0)
      expect(typeof r.soTien).toBe('number')
      expect([1, 2, 3]).toContain(r.loaiPhi)
    }
  })
})

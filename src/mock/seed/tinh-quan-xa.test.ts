/** Spec: Tỉnh→Quận→Xã→TUYEN referential integrity (section-catalog-b). */
import { describe, it, expect } from 'vitest'
import * as mod from './tinh-quan-xa'
import { TINH, QUAN, XA, TUYEN } from './tinh-quan-xa'

describe('tinh-quan-xa hierarchy', () => {
  const tinhIds = new Set(TINH.map((t) => t.id))
  const quanIds = new Set(QUAN.map((q) => q.id))
  const xaIds = new Set(XA.map((x) => x.id))
  const tuyenIds = new Set(TUYEN.map((t) => t.id))

  it('TINH contains ĐẮK LẮK', () => {
    expect(TINH.map((t) => t.ten)).toContain('ĐẮK LẮK')
  })

  it('every QUAN.tinhId resolves to a TINH', () => {
    for (const q of QUAN) expect(tinhIds.has(q.tinhId)).toBe(true)
  })

  it('every XA resolves quan/tinh, has numeric fields, optional tuyenId resolves', () => {
    for (const x of XA) {
      expect(quanIds.has(x.quanId)).toBe(true)
      expect(tinhIds.has(x.tinhId)).toBe(true)
      expect(typeof x.khoangCach).toBe('number')
      expect(typeof x.tienCong).toBe('number')
      if (x.tuyenId) expect(tuyenIds.has(x.tuyenId)).toBe(true)
    }
  })

  it('every TUYEN row resolves tinh/quan/xa + numeric route fields', () => {
    for (const t of TUYEN) {
      expect(tinhIds.has(t.tinhId)).toBe(true)
      expect(quanIds.has(t.quanId)).toBe(true)
      expect(xaIds.has(t.xaId)).toBe(true)
      expect(typeof t.caySo).toBe('number')
      expect(typeof t.tienCong).toBe('number')
      expect(typeof t.tienCong2).toBe('number')
    }
  })

  it('exports TUYEN, never a KHU_VUC symbol (avoids masterdata KhuVuc collision)', () => {
    expect('TUYEN' in mod).toBe(true)
    expect('KHU_VUC' in mod).toBe(false)
  })
})

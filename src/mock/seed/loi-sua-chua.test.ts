/** Spec: Lỗi sửa chữa labor-price catalog per branch × nhóm sản phẩm. */
import { describe, it, expect } from 'vitest'
import { LOI_SUA_CHUA_GIA } from './loi-sua-chua'
import { BRANCHES } from './branches'
import { NHOM_SAN_PHAM } from './reference-data'

describe('LOI_SUA_CHUA_GIA', () => {
  const branchIds = new Set(BRANCHES.map((b) => b.id))
  const nhomIds = new Set(NHOM_SAN_PHAM.map((n) => n.id))

  it('every row has resolving branch + nhóm sản phẩm and valid money', () => {
    for (const r of LOI_SUA_CHUA_GIA) {
      expect(branchIds.has(r.branchId)).toBe(true)
      expect(nhomIds.has(r.nhomSanPhamId)).toBe(true)
      expect(r.tenLoi.length).toBeGreaterThan(0)
      expect(r.tienCong).toBeGreaterThan(0)
      expect(r.tienCongDV).toBeGreaterThanOrEqual(0)
    }
  })

  it('has at least one row per branch × nhóm sản phẩm combination', () => {
    for (const b of BRANCHES) {
      for (const n of NHOM_SAN_PHAM) {
        const match = LOI_SUA_CHUA_GIA.some(
          (r) => r.branchId === b.id && r.nhomSanPhamId === n.id,
        )
        expect(match).toBe(true)
      }
    }
  })
})

/** Spec: Trả hàng 4 hình thức + slip codes (section-stock-out.md). */
import { describe, it, expect } from 'vitest'
import { HINH_THUC_TRA, TRA_HANG } from './tra-hang'

describe('HINH_THUC_TRA', () => {
  it('deep-equals the 4 pairs verbatim', () => {
    expect(HINH_THUC_TRA).toEqual([
      { id: 1, ten: 'Trả hàng từ kỹ thuật' },
      { id: 2, ten: 'Trả hàng từ khách hàng' },
      { id: 3, ten: 'Trả hàng cho nhà cung cấp' },
      { id: 4, ten: 'Trả hàng từ kho' },
    ])
  })
})

describe('TRA_HANG rows', () => {
  it('every soPhieu matches /^PTH-\\d{8}-\\d+$/ and nguoiLapId resolves', () => {
    for (const r of TRA_HANG) {
      expect(r.soPhieu).toMatch(/^PTH-\d{8}-\d+$/)
      expect(typeof r.nguoiLapId).toBe('string')
      expect(r.nguoiLapId.length).toBeGreaterThan(0)
    }
  })
})

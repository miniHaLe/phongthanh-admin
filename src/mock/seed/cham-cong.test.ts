/** Spec: Chấm công exception model + Kỳ linkage (section-hr.md). */
import { describe, it, expect } from 'vitest'
import { LOAI_CHAM, LOAI_TRU, CHAM_CONG } from './cham-cong'
import { KY } from './ky'

describe('Chấm công taxonomies', () => {
  it('LOAI_CHAM deep-equals the 5 pairs', () => {
    expect(LOAI_CHAM).toEqual([
      { id: 1, ten: 'Nghỉ' },
      { id: 2, ten: 'Nghỉ nữa ngày' },
      { id: 3, ten: 'Đi trễ' },
      { id: 4, ten: 'Tăng ca' },
      { id: 5, ten: 'Về sớm' },
    ])
  })

  it('LOAI_TRU deep-equals the 2 pairs', () => {
    expect(LOAI_TRU).toEqual([
      { id: 1, ten: 'Trừ tiền' },
      { id: 2, ten: 'Trừ ngày công' },
    ])
  })
})

describe('CHAM_CONG rows', () => {
  const kyIds = new Set(KY.map((k) => k.id))

  it('unit is ngày for types 1-2 and giờ for types 3-5', () => {
    for (const r of CHAM_CONG) {
      expect(r.donVi).toBe(r.loaiCham <= 2 ? 'ngày' : 'giờ')
    }
  })

  it('every record resolves nhanVienId + kyId', () => {
    for (const r of CHAM_CONG) {
      expect(r.nhanVienId.length).toBeGreaterThan(0)
      expect(kyIds.has(r.kyId)).toBe(true)
    }
  })
})

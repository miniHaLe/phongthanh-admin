/** Spec: Loại thu chi 12-value taxonomy + Tình trạng 5-state collection semantics. */
import { describe, it, expect } from 'vitest'
import {
  LOAI_THU_CHI_FILTER_OPTIONS,
  TINH_TRANG_FILTER_OPTIONS,
  isThuType,
  isChiType,
} from './thu-chi.config'

describe('thu-chi.config filter option lists', () => {
  it('Loại filter has exactly 12 options', () => {
    expect(LOAI_THU_CHI_FILTER_OPTIONS).toHaveLength(12)
  })

  it('Tình trạng options deep-equal the 5 verified collection states, in order', () => {
    expect(TINH_TRANG_FILTER_OPTIONS.map((o) => o.label)).toEqual([
      'Chưa thu',
      'Đã thu',
      'Đã thu ngoài',
      'Chưa chi',
      'Đã chi',
    ])
  })

  it('isThuType/isChiType partition the 12-value taxonomy with no overlap', () => {
    for (const o of LOAI_THU_CHI_FILTER_OPTIONS) {
      const id = Number(o.value)
      expect(isThuType(id) !== isChiType(id)).toBe(true)
    }
  })
})

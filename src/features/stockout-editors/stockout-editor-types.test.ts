/** Spec: legacy create and list-filter return-type vocabularies stay distinct. */
import { describe, expect, it } from 'vitest'
import { HINH_THUC_TRA_OPTIONS } from '@/features/stockout/tra-hang-filters'
import { HINH_THUC_TRA_EDITOR_OPTIONS } from './stockout-editor-types'

describe('return type option contracts', () => {
  it('keeps the exact legacy create-editor options', () => {
    expect(HINH_THUC_TRA_EDITOR_OPTIONS).toEqual([
      'Trả hàng từ kỹ thuật',
      'Trả hàng từ khách hàng',
      'Trả hàng cho nhà cung cấp',
      'Trả xác linh kiện',
    ])
  })

  it('keeps the exact legacy list-filter options', () => {
    expect(HINH_THUC_TRA_OPTIONS).toEqual([
      'Trả hàng từ kỹ thuật',
      'Trả hàng từ khách hàng',
      'Trả hàng cho nhà cung cấp',
      'Trả hàng từ kho',
    ])
  })
})

/** Spec: Bảng lương — exact 17-column set (16 labeled + checkbox) (section-hr.md H8). */
import { describe, it, expect } from 'vitest'
import { BANG_LUONG_COLUMNS } from './bang-luong-columns'

describe('BANG_LUONG_COLUMNS', () => {
  it('has the exact verified 16 labeled headers (+1 checkbox column = 17 total)', () => {
    expect(BANG_LUONG_COLUMNS).toEqual([
      'STT',
      'Kỳ',
      'Tên NV',
      'Phòng',
      'Chức vụ',
      'Lương cứng',
      'Bảo Hiểm',
      'Phụ cấp',
      'Tăng ca - Nghỉ',
      'Ứng lương',
      'Thưởng - Phạt',
      'Công BH',
      'Công SC',
      'Tổng lương',
      'Thực lãnh',
      'Chọn',
    ])
    expect(BANG_LUONG_COLUMNS).toHaveLength(16)
  })
})

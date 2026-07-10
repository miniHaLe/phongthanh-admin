/** Spec: Công Nợ — 10 verified columns, NO checkbox column. */
import { describe, it, expect } from 'vitest'
import { CONG_NO_COLUMN_LABELS, LOAI_THANH_TOAN_OPTIONS } from './cong-no.config'

describe('cong-no.config', () => {
  it('has exactly the 10 verified column headers, in order', () => {
    expect(CONG_NO_COLUMN_LABELS).toEqual([
      'Số phiếu',
      'Loại phiếu',
      'Ngày lập',
      'KTV',
      'Số tiền',
      'Đã trả',
      'Còn lại',
      'Tên khách hàng',
      'Điện thoại',
      'Chọn',
    ])
  })

  it('does not include a checkbox/"Chọn tất cả" column label', () => {
    expect(CONG_NO_COLUMN_LABELS).not.toContain('Chọn tất cả')
  })

  it('Loại thanh toán has exactly Phiếu sửa chữa / Phiếu bán hàng', () => {
    expect(LOAI_THANH_TOAN_OPTIONS.map((o) => o.value)).toEqual([
      'Phiếu sửa chữa',
      'Phiếu bán hàng',
    ])
  })
})

/** Spec: Hóa Đơn — 10 verified columns incl. Mã Số Thuế, no invented Trạng thái. */
import { describe, it, expect } from 'vitest'
import { hoaDonConfig } from './hoa-don.config'

describe('hoa-don.config', () => {
  it('has exactly the 9 verified data-column headers, in order', () => {
    expect(hoaDonConfig.columns.map((c) => c.header)).toEqual([
      'Số Hóa Đơn',
      'Hình Thức Thanh Toán',
      'Khách Hàng',
      'Mã Số Thuế',
      'Tiền thuế',
      'Tổng Thanh Toán',
      'Ngày Lập',
      'Người Lập',
    ])
  })

  it('does not have an invented Trạng thái column', () => {
    expect(hoaDonConfig.columns.some((c) => c.header === 'Trạng thái')).toBe(false)
  })

  it('enables bulk-delete (Xóa) and hides the generic Thêm button', () => {
    expect(hoaDonConfig.bulkDelete).toBe(true)
    expect(hoaDonConfig.addLabel).toBe(false)
  })
})

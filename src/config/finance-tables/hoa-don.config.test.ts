/** Spec: Hóa Đơn — 10 verified columns incl. Mã Số Thuế, no invented Trạng thái. */
import { describe, it, expect } from 'vitest'
import { hoaDonConfig } from './hoa-don.config'
import { filterHoaDonRows, HOA_DON_ROWS } from '@/mock/finance-mock'

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

  it('declares the Từ ngày/Đến ngày public keys as a real date range', () => {
    const dateRange = hoaDonConfig.filters?.find(
      (filter) => filter.type === 'date-range',
    )
    expect(dateRange).toMatchObject({
      key: 'ngayXuat',
      fromKey: 'tuNgay',
      toKey: 'denNgay',
    })
  })

  it('narrows invoice rows inclusively by tuNgay/denNgay', () => {
    const ordered = [...HOA_DON_ROWS].sort((a, b) =>
      a.ngayXuat.localeCompare(b.ngayXuat),
    )
    const targetDate = ordered[Math.floor(ordered.length / 2)].ngayXuat.slice(0, 10)
    const result = filterHoaDonRows(HOA_DON_ROWS, {
      tuNgay: targetDate,
      denNgay: targetDate,
    })

    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThan(HOA_DON_ROWS.length)
    expect(result.every((row) => row.ngayXuat.startsWith(targetDate))).toBe(true)
  })
})

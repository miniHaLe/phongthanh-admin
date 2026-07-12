import { describe, it, expect } from 'vitest'
import { khachHangConfig } from './khach-hang.config'

describe('khachHangConfig', () => {
  it('renders current two-level address and finance columns without district', () => {
    expect(khachHangConfig.columns.map((c) => c.header)).toEqual([
      'Tên khách hàng',
      'Điện thoại',
      'Điện thoại 2',
      'Địa chỉ',
      'Phường/Xã',
      'Tỉnh/Thành phố',
      'Email',
      'Mã số thuế',
      'Ngân hàng',
      'Số tài khoản',
      'Loại',
      'Đại lý/Trạm',
      'Người tạo',
      'Ngày tạo',
    ])
    expect(khachHangConfig.columns.map((c) => c.header)).not.toContain(
      'Quận/Huyện',
    )
  })

  it('uses the approved customer editor fields and validates tax codes', () => {
    const labels = khachHangConfig.fields.map((field) => field.label)
    expect(labels).toContain('Tên đường')
    expect(labels).toContain('Tỉnh/Thành phố')
    expect(labels).toContain('Phường/Xã')
    expect(labels).toContain('Mã số thuế')
    expect(labels).toContain('Ngân hàng')
    expect(labels).toContain('Số tài khoản')
    expect(labels).not.toContain('Quận/Huyện')

    const tax = khachHangConfig.fields.find((field) => field.key === 'maSoThue')
    expect(tax?.zodSchema?.safeParse('').success).toBe(true)
    expect(tax?.zodSchema?.safeParse('0123456789').success).toBe(true)
    expect(tax?.zodSchema?.safeParse('0123456789-001').success).toBe(true)
    expect(tax?.zodSchema?.safeParse('123').success).toBe(false)
  })

  it('has no invented Mã KH / Tổng phiếu / Trạng thái columns', () => {
    const headers = khachHangConfig.columns.map((c) => c.header)
    expect(headers).not.toContain('Mã KH')
    expect(headers).not.toContain('Tổng phiếu')
    expect(headers).not.toContain('Trạng thái')
  })

  it('Nhóm khách hàng filter has exactly 9 options', () => {
    const filter = khachHangConfig.filters?.find(
      (f) => f.key === 'loaiKhachHangId',
    )
    expect(filter?.options).toHaveLength(9)
  })

  it('opts into bulk-delete + export and hides the generic Thêm button (2 header buttons own create)', () => {
    expect(khachHangConfig.bulkDelete).toBe(true)
    expect(khachHangConfig.export).toBe(true)
    expect(khachHangConfig.addLabel).toBe(false)
  })

  it('defaults to newest-first sort', () => {
    expect(khachHangConfig.defaultSort).toEqual({
      key: 'createdAt',
      dir: 'desc',
    })
  })
})

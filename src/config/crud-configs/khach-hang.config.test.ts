import { describe, it, expect } from 'vitest'
import { khachHangConfig } from './khach-hang.config'

describe('khachHangConfig', () => {
  it('renders the exact verified 12 data-column header order (STT/checkbox/Chọn added by the page)', () => {
    expect(khachHangConfig.columns.map((c) => c.header)).toEqual([
      'Tên khách hàng',
      'Điện thoại',
      'Điện thoại 2',
      'Địa chỉ',
      'Phường/Xã',
      'Quận/Huyện',
      'Tỉnh',
      'Email',
      'Loại',
      'Đại lý/Trạm',
      'Người tạo',
      'Ngày tạo',
    ])
  })

  it('has no invented Mã KH / Tổng phiếu / Trạng thái columns', () => {
    const headers = khachHangConfig.columns.map((c) => c.header)
    expect(headers).not.toContain('Mã KH')
    expect(headers).not.toContain('Tổng phiếu')
    expect(headers).not.toContain('Trạng thái')
  })

  it('Nhóm khách hàng filter has exactly 9 options', () => {
    const filter = khachHangConfig.filters?.find((f) => f.key === 'loaiKhachHangId')
    expect(filter?.options).toHaveLength(9)
  })

  it('opts into bulk-delete + export and hides the generic Thêm button (2 header buttons own create)', () => {
    expect(khachHangConfig.bulkDelete).toBe(true)
    expect(khachHangConfig.export).toBe(true)
    expect(khachHangConfig.addLabel).toBe(false)
  })

  it('defaults to newest-first sort', () => {
    expect(khachHangConfig.defaultSort).toEqual({ key: 'createdAt', dir: 'desc' })
  })
})

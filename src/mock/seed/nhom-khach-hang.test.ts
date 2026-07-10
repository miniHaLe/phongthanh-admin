/** Spec: 9-value customer taxonomy (section-customer.md). */
import { describe, it, expect } from 'vitest'
import { LOAI_KHACH_HANG } from './nhom-khach-hang'

describe('LOAI_KHACH_HANG', () => {
  it('deep-equals the 9 id/label pairs verbatim', () => {
    expect(LOAI_KHACH_HANG).toEqual([
      { id: 1, ten: 'Khách lẻ' },
      { id: 2, ten: 'Đại lý chính' },
      { id: 3, ten: 'Đối tác MB/Nhà CC' },
      { id: 4, ten: 'Đại lý/Cửa hàng' },
      { id: 5, ten: 'Nhân viên công ty' },
      { id: 6, ten: 'Thợ sửa chữa' },
      { id: 7, ten: 'Cộng tác viên' },
      { id: 8, ten: 'Nhà xe - Chuyển phát' },
      { id: 9, ten: 'Trung tâm bảo hành' },
    ])
  })
})

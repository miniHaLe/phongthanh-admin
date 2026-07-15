import { afterEach, describe, expect, it, vi } from 'vitest'
import { khachHangConfig } from '@/config/crud-configs/khach-hang.config'
import { searchCustomersByNameOrPhone } from './customer-tax-search'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('customer invoice search', () => {
  it('uses the customer API search path and maps the response', async () => {
    const list = vi.spyOn(khachHangConfig.mockApi, 'list').mockResolvedValue({
      data: [
        {
          id: 'kh-1',
          tenKH: 'Nguyễn Văn A',
          dienThoai: '0900000000',
          diaChi: 'Buôn Ma Thuột',
          tinhId: 'tinh-1',
          loaiKhachHangId: 1,
          nguoiTao: 'admin',
          active: true,
          createdAt: '2026-07-15T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    })

    await expect(searchCustomersByNameOrPhone('Nguyễn')).resolves.toEqual([
      {
        id: 'kh-1',
        label: 'Nguyễn Văn A — 0900000000',
        tenDonVi: 'Nguyễn Văn A',
        diaChi: 'Buôn Ma Thuột',
      },
    ])
    expect(list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      search: 'Nguyễn',
    })
  })
})

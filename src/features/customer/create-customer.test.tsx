import { afterEach, describe, expect, it, vi } from 'vitest'
import { customerApi, persistCustomer } from './create-customer'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('customer create sync', () => {
  it('creates through the config API instead of mutating masterdata directly', async () => {
    const created = {
      id: 'kh-real',
      tenKH: 'Khách thật',
      dienThoai: '0900000000',
      tinhId: 'tinh-1',
      loaiKhachHangId: 1,
      nguoiTao: 'Admin',
      active: true,
      createdAt: '2026-07-15T00:00:00.000Z',
    }
    const create = vi
      .spyOn(customerApi, 'create')
      .mockResolvedValue(created)

    await expect(
      persistCustomer({
        tenKH: 'Khách thật',
        dienThoai: '0900000000',
        tinhId: 'tinh-1',
        loaiKhachHangId: 1,
      }),
    ).resolves.toEqual(created)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenKH: 'Khách thật',
        tinhId: 'tinh-1',
        active: true,
      }),
    )
  })
})

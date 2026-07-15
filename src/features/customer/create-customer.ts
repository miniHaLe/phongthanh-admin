/** Shared real-or-mock create mutation for both customer create flows. */
import { khachHangConfig } from '@/config/crud-configs/khach-hang.config'
import { CURRENT_USER } from '@/mock/current-user-mock'
import type { KhachHang } from '@/types/masterdata-types'

export interface CreateCustomerInput {
  tenKH: string
  dienThoai: string
  dienThoai2?: string
  email?: string
  diaChi?: string
  tinhId: string
  quanId?: string
  phuongXaId?: string
  loaiKhachHangId: number
  daiLyId?: string
  ghiChu?: string
}

export function createCustomer(input: CreateCustomerInput): Promise<KhachHang> {
  return khachHangConfig.mockApi.create({
    ...input,
    nguoiTao: CURRENT_USER.hoVaTen,
    active: true,
  })
}

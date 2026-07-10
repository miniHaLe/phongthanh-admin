/**
 * Mock create mutation shared by both customer create flows (Thêm Khách Hàng
 * / Thêm Đại Lý). Writes directly into the live `KHACH_HANG_ROWS` store
 * (owned by mock/masterdata/khach-hang.mock.ts) so the list immediately
 * reflects the new row on refetch — module-memory only, lost on reload.
 */
import { KHACH_HANG_ROWS } from '@/mock/masterdata/khach-hang.mock'
import { CURRENT_USER } from '@/mock/current-user-mock'
import type { KhachHang } from '@/types/masterdata-types'

let khachHangSeq = KHACH_HANG_ROWS.length

export interface CreateCustomerInput {
  tenKH: string
  dienThoai: string
  dienThoai2?: string
  email?: string
  diaChi?: string
  tinhId?: string
  quanId?: string
  phuongXaId?: string
  loaiKhachHangId: number
  daiLyId?: string
  ghiChu?: string
}

export function createCustomer(input: CreateCustomerInput): KhachHang {
  khachHangSeq += 1
  const row: KhachHang = {
    id: `kh-new-${khachHangSeq}`,
    ...input,
    nguoiTao: CURRENT_USER.hoVaTen,
    active: true,
    createdAt: new Date().toISOString(),
  }
  KHACH_HANG_ROWS.unshift(row)
  return row
}

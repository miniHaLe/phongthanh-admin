import { apiFor } from '@/api/api-for'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { KHACH_HANG_ROWS } from '@/mock/masterdata/khach-hang.mock'
import type { KhachHang } from '@/types/masterdata-types'
import type { ListParams } from '@/mock/seed'

export const customerApi = apiFor('khach-hang', KHACH_HANG_ROWS)

export type CustomerMutationInput = Omit<KhachHang, 'id' | 'createdAt'>

export async function persistCustomer(
  input: Omit<CustomerMutationInput, 'nguoiTao' | 'active'>,
): Promise<KhachHang> {
  return customerApi.create({
    ...input,
    nguoiTao: CURRENT_USER.hoVaTen,
    active: true,
  })
}

let legacyCustomerSequence = KHACH_HANG_ROWS.length

/** Dealer compatibility path. New customer editors use persistCustomer(). */
export function createCustomer(
  input: Omit<CustomerMutationInput, 'nguoiTao' | 'active'>,
): KhachHang {
  legacyCustomerSequence += 1
  const row: KhachHang = {
    ...input,
    id: `kh-new-${legacyCustomerSequence}`,
    nguoiTao: CURRENT_USER.hoVaTen,
    active: true,
    createdAt: new Date().toISOString(),
  }
  KHACH_HANG_ROWS.unshift(row)
  return row
}

export async function updateCustomer(
  id: string,
  input: Partial<KhachHang>,
): Promise<KhachHang> {
  return customerApi.update(id, input)
}

export function listCustomers(params: ListParams) {
  return customerApi.list(params)
}

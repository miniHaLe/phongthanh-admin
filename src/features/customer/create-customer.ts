import { apiFor } from '@/api/api-for'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { KHACH_HANG_ROWS } from '@/mock/masterdata/khach-hang.mock'
import type { KhachHang } from '@/types/masterdata-types'
import type { ListParams } from '@/mock/seed'

export const customerApi = apiFor('khach-hang', KHACH_HANG_ROWS)

export type CustomerMutationInput = Omit<KhachHang, 'id' | 'createdAt'> & {
  /** Command-only marker; the API strips it before writing the entity row. */
  clearDiaChi?: true
}

export async function persistCustomer(
  input: Omit<CustomerMutationInput, 'nguoiTao' | 'active'>,
): Promise<KhachHang> {
  return customerApi.create({
    ...input,
    nguoiTao: CURRENT_USER.hoVaTen,
    active: true,
  })
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerMutationInput>,
): Promise<KhachHang> {
  return customerApi.update(id, input)
}

export function listCustomers(params: ListParams) {
  return customerApi.list(params)
}

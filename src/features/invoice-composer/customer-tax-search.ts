/**
 * Mã số thuế customer search-modal lookup for the invoice composer. The live
 * Uses the selected real-or-mock customer API, then maps name/phone/tax data
 * for the invoice picker.
 */
import { khachHangConfig } from '@/config/crud-configs/khach-hang.config'

export interface CustomerTaxMatch {
  id: string
  label: string
  tenDonVi: string
  diaChi: string
}

export async function searchCustomersByNameOrPhone(
  query: string,
): Promise<CustomerTaxMatch[]> {
  const q = query.trim()
  if (!q) return []
  const result = await khachHangConfig.mockApi.list({
    page: 1,
    pageSize: 10,
    search: q,
  })
  return result.data.map((k) => ({
    id: k.id,
    label: `${k.tenKH} — ${k.maSoThue || k.dienThoai}`,
    tenDonVi: k.tenKH,
    diaChi: k.diaChi ?? '',
  }))
}

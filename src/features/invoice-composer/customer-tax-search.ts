/**
 * Mã số thuế customer search-modal lookup for the invoice composer. The live
 * KhachHang store has no maSoThue field (see masterdata-types.ts), so this
 * matches by name/phone (mirroring the reference's "Nhập tên hoặc số điện
 * thoại" tooltip on the invoice's customer field) and auto-fills Tên đơn vị +
 * Địa chỉ from the matched row.
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
    label: `${k.tenKH} — ${k.dienThoai}`,
    tenDonVi: k.tenKH,
    diaChi: k.diaChi ?? '',
  }))
}

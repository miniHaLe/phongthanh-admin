/**
 * Mã số thuế customer search-modal lookup for the invoice composer. The live
 * Matches tax code first while retaining name/phone compatibility for old
 * customer rows that have not been enriched yet.
 */
import { KHACH_HANG_ROWS } from '@/mock/masterdata'
import type { KhachHang } from '@/types/masterdata-types'

export interface CustomerTaxMatch {
  id: string
  label: string
  tenDonVi: string
  diaChi: string
}

export function searchCustomersByNameOrPhone(
  query: string,
): CustomerTaxMatch[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const matches: KhachHang[] = KHACH_HANG_ROWS.filter(
    (k) =>
      k.maSoThue?.toLowerCase().includes(q) ||
      k.tenKH.toLowerCase().includes(q) ||
      k.dienThoai.includes(query.trim()),
  ).slice(0, 10)
  return matches.map((k) => ({
    id: k.id,
    label: `${k.tenKH} — ${k.maSoThue || k.dienThoai}`,
    tenDonVi: k.tenKH,
    diaChi: k.diaChi ?? '',
  }))
}

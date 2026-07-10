/**
 * Mã số thuế customer search-modal lookup for the invoice composer. The live
 * KhachHang store has no maSoThue field (see masterdata-types.ts), so this
 * matches by name/phone (mirroring the reference's "Nhập tên hoặc số điện
 * thoại" tooltip on the invoice's customer field) and auto-fills Tên đơn vị +
 * Địa chỉ from the matched row.
 */
import { KHACH_HANG_ROWS } from '@/mock/masterdata'
import type { KhachHang } from '@/types/masterdata-types'

export interface CustomerTaxMatch {
  id: string
  label: string
  tenDonVi: string
  diaChi: string
}

export function searchCustomersByNameOrPhone(query: string): CustomerTaxMatch[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const matches: KhachHang[] = KHACH_HANG_ROWS.filter(
    (k) => k.tenKH.toLowerCase().includes(q) || k.dienThoai.includes(query.trim()),
  ).slice(0, 10)
  return matches.map((k) => ({
    id: k.id,
    label: `${k.tenKH} — ${k.dienThoai}`,
    tenDonVi: k.tenKH,
    diaChi: k.diaChi ?? '',
  }))
}

/**
 * "Phiếu sửa chữa" lookup for the Cấp Linh Kiện line-entry panel — searches
 * MOCK_TICKETS by Số Phiếu SC / Số Phiếu Hãng / Tên Khách Hàng / Số Serial and
 * exposes the info-panel fields the reference shows once a ticket is picked.
 */
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { MANUFACTURERS, MODELS } from '@/domains/repair/reference-data'
import type { AutocompleteOption } from '@/components/shared'

export interface RepairTicketOption extends AutocompleteOption {
  soPhieu: string
  khachHang: string
  dienThoai: string
  ngayNhan: string
  nhaSanXuat: string
  model: string
  serial: string
}

const MANUFACTURER_BY_ID = new Map(MANUFACTURERS.map((m) => [m.id, m.ten]))
const MODEL_BY_ID = new Map(MODELS.map((m) => [m.id, m.ten]))

export async function searchRepairTickets(query: string): Promise<RepairTicketOption[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const matches = MOCK_TICKETS.filter(
    (t) =>
      t.soPhieu.toLowerCase().includes(q) ||
      (t.soPhieuHang?.toLowerCase().includes(q) ?? false) ||
      t.khachHang.ten.toLowerCase().includes(q) ||
      (t.soSerial?.toLowerCase().includes(q) ?? false),
  ).slice(0, 15)

  return matches.map((t) => ({
    id: t.id,
    label: `${t.soPhieu} — ${t.khachHang.ten}`,
    soPhieu: t.soPhieu,
    khachHang: t.khachHang.ten,
    dienThoai: t.khachHang.sdt,
    ngayNhan: t.ngayNhan,
    nhaSanXuat: MANUFACTURER_BY_ID.get(t.nhaSanXuatId) ?? '',
    model: MODEL_BY_ID.get(t.modelId) ?? '',
    serial: t.soSerial ?? '',
  }))
}

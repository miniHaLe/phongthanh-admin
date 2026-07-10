/**
 * Phí giao — seeded 1:1 from the P1 `PHI_GIAO` lookup fixture
 * (mock/seed/phi-giao.ts), which is already linked to the appliance `SAN_PHAM`
 * lookup (mock/seed/reference-data.ts) rather than to Khu vực.
 */
import type { PhiGiao } from '@/types/masterdata-types'
import { PHI_GIAO } from '@/mock/seed/phi-giao'
import { makeMockApi } from './make-mock-api'

export const PHI_GIAO_ROWS: PhiGiao[] = PHI_GIAO.map((p, i) => ({
  id: `pg-${i + 1}`,
  sanPhamId: p.sanPhamId,
  tenPhi: p.tenPhi,
  soTien: p.soTien,
  loaiPhi: p.loaiPhi,
  ghiChu: p.ghiChu || undefined,
  active: true,
  createdAt: new Date(2024, 0, i + 1).toISOString(),
}))

export const phiGiaoApi = makeMockApi<PhiGiao>(PHI_GIAO_ROWS)

/**
 * Khu vực — re-modeled as a delivery-route entity on the P1 Tỉnh→Quận→Xã
 * hierarchy (Finding 2). Seeded 1:1 from the P1 `TUYEN` lookup fixture
 * (mock/seed/tinh-quan-xa.ts) into this live, mutable CRUD table — TUYEN
 * itself is never mutated.
 */
import type { KhuVuc } from '@/types/masterdata-types'
import { TUYEN } from '@/mock/seed/tinh-quan-xa'
import { makeMockApi } from './make-mock-api'

export const KHU_VUC_ROWS: KhuVuc[] = TUYEN.map((t, i) => ({
  id: `kv-${i + 1}`,
  tenKhuVuc: t.ten,
  tinhId: t.tinhId,
  quanId: t.quanId,
  xaId: t.xaId,
  caySo: t.caySo,
  tienCong: t.tienCong,
  tienCong2: t.tienCong2,
  active: true,
  createdAt: new Date(2024, 0, i + 1).toISOString(),
}))

export const khuVucApi = makeMockApi<KhuVuc>(KHU_VUC_ROWS)

/**
 * Khu vực — delivery-route rows on the post-2025 two-level Tỉnh→Phường/Xã
 * hierarchy. Seeded from the legacy `TUYEN` fixture (mock/seed/tinh-quan-xa.ts),
 * mapping each old Tỉnh onto its official snapshot province code.
 *
 * The 2025 merger renamed/merged communes, so the old xã ids don't map 1:1 onto
 * snapshot commune codes. Per plan decision, legacy mock rows keep the province
 * and leave `phuongXaCode` empty (table renders "—"); NEW rows created via the
 * quick-add dialog REQUIRE a commune. TUYEN itself is never mutated.
 */
import type { KhuVuc } from '@/types/masterdata-types'
import { TUYEN } from '@/mock/seed/tinh-quan-xa'
import { makeMockApi } from './make-mock-api'

/** Legacy TUYEN tỉnh id → official 2-digit snapshot province code. */
const TINH_ID_TO_CODE: Record<string, string> = {
  'tinh-dak-lak': '66', // Tỉnh Đắk Lắk
  'tinh-dak-nong': '66', // Post-merger absorbed into Đắk Lắk region; nearest code
}
const FALLBACK_TINH_CODE = '66'

export const KHU_VUC_ROWS: KhuVuc[] = TUYEN.map((t, i) => ({
  id: `kv-${i + 1}`,
  tenKhuVuc: t.ten,
  tinhCode: TINH_ID_TO_CODE[t.tinhId] ?? FALLBACK_TINH_CODE,
  phuongXaCode: '',
  caySo: t.caySo,
  tienCong: t.tienCong,
  tienCong2: t.tienCong2,
  active: true,
  createdAt: new Date(2024, 0, i + 1).toISOString(),
}))

export const khuVucApi = makeMockApi<KhuVuc>(KHU_VUC_ROWS)

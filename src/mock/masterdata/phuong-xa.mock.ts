/**
 * Phường/Xã — seeded 1:1 from the P1 `XA` lookup fixture
 * (mock/seed/tinh-quan-xa.ts) into this live, mutable CRUD table.
 */
import type { PhuongXa } from '@/types/masterdata-types'
import { XA } from '@/mock/seed/tinh-quan-xa'
import { makeMockApi } from './make-mock-api'

export const PHUONG_XA_ROWS: PhuongXa[] = XA.map((x, i) => ({
  id: `px-${i + 1}`,
  tenPhuongXa: x.ten,
  tinhId: x.tinhId,
  quanId: x.quanId,
  khoangCach: x.khoangCach,
  tienCong: x.tienCong,
  tuyenId: x.tuyenId,
  active: true,
  createdAt: new Date(2024, 0, i + 1).toISOString(),
}))

export const phuongXaApi = makeMockApi<PhuongXa>(PHUONG_XA_ROWS)

/**
 * Lỗi sửa chữa — seeded 1:1 from the P1 `LOI_SUA_CHUA_GIA` labor-price fixture
 * (mock/seed/loi-sua-chua.ts): one row per branch × product-group × fault.
 */
import type { LoiSuaChua } from '@/types/masterdata-types'
import { LOI_SUA_CHUA_GIA } from '@/mock/seed/loi-sua-chua'
import { makeMockApi } from './make-mock-api'

export const LOI_SUA_CHUA_ROWS: LoiSuaChua[] = LOI_SUA_CHUA_GIA.map((l, i) => ({
  id: `lsc-${i + 1}`,
  branchId: l.branchId,
  nhomSanPhamId: l.nhomSanPhamId,
  tenLoi: l.tenLoi,
  tienCong: l.tienCong,
  tienCongDV: l.tienCongDV,
  active: true,
  createdAt: new Date(2024, 0, i + 1).toISOString(),
}))

export const loiSuaChuaApi = makeMockApi<LoiSuaChua>(LOI_SUA_CHUA_ROWS)

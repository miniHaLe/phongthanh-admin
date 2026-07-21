/**
 * Product seed — 80 product records across categories.
 * Additive reference data; pages can migrate to this later.
 */
import { SeededRandom } from '@/lib/seeded-random'
import {
  NHA_SAN_XUAT,
  MODELS,
  NHOM_SAN_PHAM,
  DON_VI_TINH,
} from './reference-data'
import type { BaseEntity } from './index'

export interface SeedProduct extends BaseEntity {
  tenSanPham: string
  nhaSxId: string
  nhomSanPhamId: string
  modelId: string
  donViTinhId: string
  giaBan: number
  giaNhap: number
}

const rng = new SeededRandom(8003)

// Map appliance-category sanPhamId on model → nhomSanPhamId
const SANPHAM_TO_NHOM: Record<string, string> = {
  'sp-tulanh': 'nsp-tulanh',
  'sp-maylanh': 'nsp-maylanh',
  'sp-maygiat': 'nsp-maygiat',
  'sp-tivi': 'nsp-tivi',
  'sp-giadung': 'nsp-giadung',
}

const BASE_TIMESTAMP = 1_719_792_000_000

export const SEED_PRODUCTS: SeedProduct[] = Array.from(
  { length: 80 },
  (_, i) => {
    const model = rng.pick(MODELS)
    const nsx =
      NHA_SAN_XUAT.find((n) => n.id === model.nhaSxId) ?? NHA_SAN_XUAT[0]
    const nhomSPId = SANPHAM_TO_NHOM[model.sanPhamId] ?? 'nsp-giadung'
    const nhomSP =
      NHOM_SAN_PHAM.find((n) => n.id === nhomSPId) ?? NHOM_SAN_PHAM[0]
    const dvt = nhomSPId === 'nsp-giadung' ? DON_VI_TINH[0] : DON_VI_TINH[1] // cái vs chiếc
    const giaBan = rng.int(2, 50) * 500_000
    const giaNhap = Math.round(giaBan * (0.65 + rng.float() * 0.2))
    const createdMs = BASE_TIMESTAMP - rng.int(0, 700) * 86_400_000
    return {
      id: `sp-seed-${String(i + 1).padStart(3, '0')}`,
      tenSanPham: `${nsx.ten} ${model.ten}`,
      nhaSxId: nsx.id,
      nhomSanPhamId: nhomSP.id,
      modelId: model.id,
      donViTinhId: dvt.id,
      giaBan,
      giaNhap,
      createdAt: new Date(createdMs).toISOString(),
      updatedAt: rng.bool(0.25)
        ? new Date(createdMs + rng.int(1, 90) * 86_400_000).toISOString()
        : undefined,
      active: rng.bool(0.95),
    }
  },
)

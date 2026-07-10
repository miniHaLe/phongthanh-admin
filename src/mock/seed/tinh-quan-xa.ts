/**
 * Tỉnh → Quận → Xã administrative hierarchy + TUYEN (route) lookup.
 * Reference shape from catalog-b (Khu vực / Phường-Xã). The route entity is
 * named TUYEN (type `Tuyen`) — NOT `KhuVuc` — so it never collides with the
 * live `masterdata-types.ts` `KhuVuc`. Consumed by P6 (Khu vực, Phường/Xã,
 * customers) and P3 filters. Deterministic (SeededRandom seed 4002).
 */
import { SeededRandom } from '@/lib/seeded-random'

export interface Tinh {
  id: string
  ten: string
}
export interface Quan {
  id: string
  ten: string
  tinhId: string
}
export interface Xa {
  id: string
  ten: string
  quanId: string
  tinhId: string
  khoangCach: number // km
  tienCong: number // VND
  tuyenId?: string
}
export interface Tuyen {
  id: string
  ten: string // Tên khu vực
  tinhId: string
  quanId: string
  xaId: string
  caySo: number // Cây số (km)
  tienCong: number
  tienCong2: number
}

const rng = new SeededRandom(4002)

export const TINH: Tinh[] = [
  { id: 'tinh-dak-lak', ten: 'ĐẮK LẮK' },
  { id: 'tinh-dak-nong', ten: 'ĐẮK NÔNG' },
]

export const QUAN: Quan[] = [
  { id: 'quan-bmt', ten: 'Tp. Buôn Ma Thuột', tinhId: 'tinh-dak-lak' },
  { id: 'quan-ea-hleo', ten: "Ea H'Leo", tinhId: 'tinh-dak-lak' },
  { id: 'quan-cu-mgar', ten: "Cư M'gar", tinhId: 'tinh-dak-lak' },
  { id: 'quan-gia-nghia', ten: 'Tp. Gia Nghĩa', tinhId: 'tinh-dak-nong' },
  { id: 'quan-dak-rlap', ten: "Đắk R'Lấp", tinhId: 'tinh-dak-nong' },
  { id: 'quan-cu-jut', ten: 'Cư Jút', tinhId: 'tinh-dak-nong' },
]

const XA_DEFS: Array<{ id: string; ten: string; quanId: string }> = [
  { id: 'xa-tan-loi', ten: 'Phường Tân Lợi', quanId: 'quan-bmt' },
  { id: 'xa-thang-loi', ten: 'Phường Thắng Lợi', quanId: 'quan-bmt' },
  { id: 'xa-ea-tam', ten: 'Phường Ea Tam', quanId: 'quan-bmt' },
  { id: 'xa-tu-an', ten: 'Phường Tự An', quanId: 'quan-bmt' },
  { id: 'xa-khanh-xuan', ten: 'Phường Khánh Xuân', quanId: 'quan-bmt' },
  { id: 'xa-ea-drang', ten: 'Thị trấn Ea Drăng', quanId: 'quan-ea-hleo' },
  { id: 'xa-ea-hleo', ten: "Xã Ea H'Leo", quanId: 'quan-ea-hleo' },
  { id: 'xa-quang-phu', ten: 'Thị trấn Quảng Phú', quanId: 'quan-cu-mgar' },
  { id: 'xa-ea-pok', ten: "Xã Ea Pốk", quanId: 'quan-cu-mgar' },
  { id: 'xa-nghia-phu', ten: 'Phường Nghĩa Phú', quanId: 'quan-gia-nghia' },
  { id: 'xa-nghia-duc', ten: 'Phường Nghĩa Đức', quanId: 'quan-gia-nghia' },
  { id: 'xa-nghia-xuan', ten: 'Phường Nghĩa Xuân', quanId: 'quan-gia-nghia' },
  { id: 'xa-kien-duc', ten: 'Thị trấn Kiến Đức', quanId: 'quan-dak-rlap' },
  { id: 'xa-dak-rmoan', ten: "Xã Đắk R'Moan", quanId: 'quan-dak-rlap' },
  { id: 'xa-ea-tling', ten: "Thị trấn Ea T'Ling", quanId: 'quan-cu-jut' },
  { id: 'xa-tam-thang', ten: 'Xã Tâm Thắng', quanId: 'quan-cu-jut' },
]

const QUAN_TINH = new Map(QUAN.map((q) => [q.id, q.tinhId]))

/** One TUYEN (route) per district, covering its first xã. */
export const TUYEN: Tuyen[] = QUAN.map((q, i) => {
  const firstXa = XA_DEFS.find((x) => x.quanId === q.id)!
  return {
    id: `tuyen-${String(i + 1).padStart(2, '0')}`,
    ten: `Tuyến ${q.ten}`,
    tinhId: q.tinhId,
    quanId: q.id,
    xaId: firstXa.id,
    caySo: rng.int(5, 60),
    tienCong: rng.int(2, 10) * 50_000,
    tienCong2: rng.int(2, 8) * 50_000,
  }
})

const TUYEN_BY_QUAN = new Map(TUYEN.map((t) => [t.quanId, t.id]))

export const XA: Xa[] = XA_DEFS.map((x) => ({
  id: x.id,
  ten: x.ten,
  quanId: x.quanId,
  tinhId: QUAN_TINH.get(x.quanId)!,
  khoangCach: rng.int(1, 45),
  tienCong: rng.int(1, 8) * 50_000,
  tuyenId: TUYEN_BY_QUAN.get(x.quanId),
}))

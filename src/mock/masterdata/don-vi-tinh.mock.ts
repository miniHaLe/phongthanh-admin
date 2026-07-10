import { SeededRandom } from '@/lib/seeded-random'
import type { DonViTinh } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1017)

const DVT_LIST = [
  'Cái',
  'Chiếc',
  'Bộ',
  'Hộp',
  'Gói',
  'Cuộn',
  'Mét',
  'Gram',
  'Kg',
  'Lít',
  'Chai',
  'Lon',
]

export const DON_VI_TINH_ROWS: DonViTinh[] = DVT_LIST.map((ten, i) => ({
  id: `dvt-${i + 1}`,
  tenDVT: ten,
  active: rng.bool(0.95),
  createdAt: rng.isoDateWithin(400),
  updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
}))

export const donViTinhApi = makeMockApi<DonViTinh>(DON_VI_TINH_ROWS)

import { SeededRandom } from '@/lib/seeded-random'
import type { NganChua } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { NHA_KHO_ROWS } from './nha-kho.mock'

const rng = new SeededRandom(1015)

const NGAN_NAMES = [
  'A1',
  'A2',
  'A3',
  'B1',
  'B2',
  'B3',
  'C1',
  'C2',
  'D1',
  'D2',
  'E1',
  'E2',
  'F1',
  'F2',
  'G1',
  'G2',
]

export const NGAN_CHUA_ROWS: NganChua[] = NGAN_NAMES.map((ngan, i) => ({
  id: `ngc-${i + 1}`,
  tenNgan: `Ngăn ${ngan}`,
  nhaKhoId: rng.pick(NHA_KHO_ROWS).id,
  active: rng.bool(0.9),
  createdAt: rng.isoDateWithin(400),
  updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
}))

export const nganChuaApi = makeMockApi<NganChua>(NGAN_CHUA_ROWS)

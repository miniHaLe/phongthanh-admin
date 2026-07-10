import { SeededRandom } from '@/lib/seeded-random'
import { makeMockApi } from '@/mock/masterdata'
import type { PhuCap, LoaiPhuCap } from './types'

const rng = new SeededRandom(9002)

const PHU_CAP_LIST: Array<[string, LoaiPhuCap, number]> = [
  ['Phụ cấp ăn trưa', 'Ăn Chia', 500_000],
  ['Phụ cấp xăng xe', 'Tiền mặt', 300_000],
  ['Phụ cấp điện thoại', 'Tiền mặt', 200_000],
  ['Phụ cấp chức vụ', 'Tiền mặt', 1_000_000],
  ['Phụ cấp thâm niên', 'Ăn Chia', 400_000],
  ['Phụ cấp độc hại', 'Tiền mặt', 250_000],
]

export const PHU_CAP_ROWS: PhuCap[] = PHU_CAP_LIST.map(
  ([tenPhuCap, loaiPhuCap, giaTri], i) => ({
    id: `pc-${i + 1}`,
    tenPhuCap,
    loaiPhuCap,
    giaTri,
    active: true,
    createdAt: rng.isoDateWithin(500),
    updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
  }),
)

export const phuCapApi = makeMockApi<PhuCap>(PHU_CAP_ROWS)

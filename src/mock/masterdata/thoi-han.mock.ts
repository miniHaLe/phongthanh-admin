import { SeededRandom } from '@/lib/seeded-random'
import type { ThoiHan } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1019)

const TH_LIST: Array<[string, 'Tháng' | 'Năm', number]> = [
  ['Không bảo hành', 'Tháng', 0],
  ['1 tháng', 'Tháng', 1],
  ['2 tháng', 'Tháng', 2],
  ['3 tháng', 'Tháng', 3],
  ['6 tháng', 'Tháng', 6],
  ['12 tháng', 'Tháng', 12],
  ['1 năm', 'Năm', 1],
  ['2 năm', 'Năm', 2],
  ['3 năm', 'Năm', 3],
]

export const THOI_HAN_ROWS: ThoiHan[] = TH_LIST.map(([ten, loai, gt], i) => ({
  id: `th-${i + 1}`,
  ten,
  loai,
  thoiGian: gt,
  active: rng.bool(0.95),
  createdAt: rng.isoDateWithin(500),
  updatedAt: rng.bool(0.1) ? rng.isoDateWithin(90) : undefined,
}))

export const thoiHanApi = makeMockApi<ThoiHan>(THOI_HAN_ROWS)

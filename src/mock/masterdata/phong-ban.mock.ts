import { SeededRandom } from '@/lib/seeded-random'
import type { PhongBan } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1009)

const PB_LIST = [
  'Kỹ thuật',
  'Tiếp nhận',
  'Kế toán',
  'Kinh doanh',
  'Kho',
  'Nhân sự',
  'Ban giám đốc',
  'Bảo hành',
]

export const PHONG_BAN_ROWS: PhongBan[] = PB_LIST.map((ten, i) => ({
  id: `pb-${i + 1}`,
  maPhongBan: `PB${String(i + 1).padStart(3, '0')}`,
  tenPhongBan: ten,
  active: rng.bool(0.95),
  createdAt: rng.isoDateWithin(500),
  updatedAt: rng.bool(0.2) ? rng.isoDateWithin(90) : undefined,
}))

export const phongBanApi = makeMockApi<PhongBan>(PHONG_BAN_ROWS)

import { SeededRandom } from '@/lib/seeded-random'
import { makeMockApi } from '@/mock/masterdata'
import type { LoaiPhatThuong, LoaiThuongPhat } from './types'

const rng = new SeededRandom(9003)

const LOAI_PHAT_THUONG_LIST: Array<[LoaiThuongPhat, string]> = [
  ['Thưởng', 'Thưởng hoàn thành KPI'],
  ['Thưởng', 'Thưởng lễ Tết'],
  ['Thưởng', 'Thưởng sáng kiến'],
  ['Phạt', 'Phạt đi trễ'],
  ['Phạt', 'Phạt vi phạm quy trình'],
  ['Phạt', 'Phạt nghỉ không phép'],
]

export const LOAI_PHAT_THUONG_ROWS: LoaiPhatThuong[] = LOAI_PHAT_THUONG_LIST.map(
  ([loai, tenLoai], i) => ({
    id: `lpt-${i + 1}`,
    loai,
    tenLoai,
    active: true,
    createdAt: rng.isoDateWithin(500),
    updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
  }),
)

export const loaiPhatThuongApi = makeMockApi<LoaiPhatThuong>(
  LOAI_PHAT_THUONG_ROWS,
)

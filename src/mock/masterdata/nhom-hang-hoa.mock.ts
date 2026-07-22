import { SeededRandom } from '@/lib/seeded-random'
import type { NhomHangHoa } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1016)

// Stable goods groups for refrigeration and household-appliance operations.
const NHOM_HH = [
  'Thiết bị điện lạnh',
  'Thiết bị điện tử nghe nhìn',
  'Thiết bị điện gia dụng',
  'Linh kiện điện lạnh',
  'Linh kiện điện - điện tử',
  'Dụng cụ sửa chữa',
  'Vật tư và môi chất lạnh',
  'Phụ kiện lắp đặt và vệ sinh',
]

export const NHOM_HANG_HOA_ROWS: NhomHangHoa[] = NHOM_HH.map((ten, i) => ({
  id: `nhh-${i + 1}`,
  maNhom: `NHH${String(i + 1).padStart(3, '0')}`,
  tenNhom: ten,
  active: true,
  createdAt: rng.isoDateWithin(400),
  updatedAt: rng.bool(0.2) ? rng.isoDateWithin(90) : undefined,
}))

export const nhomHangHoaApi = makeMockApi<NhomHangHoa>(NHOM_HANG_HOA_ROWS)

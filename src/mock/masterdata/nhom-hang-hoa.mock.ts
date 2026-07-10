import { SeededRandom } from '@/lib/seeded-random'
import type { NhomHangHoa } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1016)

// The 8 verified reference categories (Hàng hóa editor ProductTypeId select2).
const NHOM_HH = [
  'Điện lạnh',
  'Điện tử',
  'Điện Thoại',
  'Điện gia dụng',
  'Linh kiện điện tử',
  'Dụng cụ sửa chữa',
  'Nguyên vật liệu sửa chữa',
  'Nhà vệ sinh',
]

export const NHOM_HANG_HOA_ROWS: NhomHangHoa[] = NHOM_HH.map((ten, i) => ({
  id: `nhh-${i + 1}`,
  maNhom: `NHH${String(i + 1).padStart(3, '0')}`,
  tenNhom: ten,
  active: rng.bool(0.92),
  createdAt: rng.isoDateWithin(400),
  updatedAt: rng.bool(0.2) ? rng.isoDateWithin(90) : undefined,
}))

export const nhomHangHoaApi = makeMockApi<NhomHangHoa>(NHOM_HANG_HOA_ROWS)

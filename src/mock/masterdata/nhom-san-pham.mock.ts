import { SeededRandom } from '@/lib/seeded-random'
import type { NhomSanPham } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1003)

const NHOM_SP = [
  'Điện thoại thông minh',
  'Máy tính bảng',
  'Laptop',
  'Đồng hồ thông minh',
  'Tai nghe không dây',
  'Loa bluetooth',
  'Pin sạc dự phòng',
  'Cáp sạc',
  'Ốp lưng',
  'Kính cường lực',
  'Bàn phím',
  'Chuột máy tính',
]

export const NHOM_SAN_PHAM_ROWS: NhomSanPham[] = NHOM_SP.map((ten, i) => ({
  id: `nhomsp-${i + 1}`,
  tenNhomSP: ten,
  active: rng.bool(0.92),
  createdAt: rng.isoDateWithin(400),
  updatedAt: rng.bool(0.25) ? rng.isoDateWithin(90) : undefined,
}))

export const nhomSanPhamApi = makeMockApi<NhomSanPham>(NHOM_SAN_PHAM_ROWS)

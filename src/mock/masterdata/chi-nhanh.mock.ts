import { SeededRandom } from '@/lib/seeded-random'
import type { ChiNhanh } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1008)

const BRANCHES: Array<[string, string, string]> = [
  ['Phong Thành Buôn Ma Thuột', '123 Lê Duẩn, Buôn Ma Thuột', '12.6797, 108.0378'],
  ['Phong Thành Gia Nghĩa', '45 Hùng Vương, Gia Nghĩa', '12.0045, 107.6877'],
  ['Cộng tác viên tuyến huyện', 'Tuyến huyện Đắk Lắk - Đắk Nông', '12.3, 107.9'],
]

export const CHI_NHANH_ROWS: ChiNhanh[] = BRANCHES.map(([ten, dia, toaDo], i) => ({
  id: `cn-${i + 1}`,
  tenChiNhanh: ten,
  soDienThoai: `0262${rng.int(1000000, 9999999)}`,
  hotline: `1900${rng.int(1000, 9999)}`,
  nguoiLienHe: rng.pick(['Nguyễn Văn Quản', 'Trần Thị Lý', 'Lê Hữu Nam']),
  email: `cn${i + 1}@phongthanh.vn`,
  diaChi: dia,
  toaDo,
  chinh: i === 0,
  chuyenCn: true,
  active: true,
  createdAt: rng.isoDateWithin(730),
  updatedAt: rng.bool(0.4) ? rng.isoDateWithin(60) : undefined,
}))

export const chiNhanhApi = makeMockApi<ChiNhanh>(CHI_NHANH_ROWS)

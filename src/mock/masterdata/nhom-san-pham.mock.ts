import { SeededRandom } from '@/lib/seeded-random'
import type { NhomSanPham } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1003)

const NHOM_SP = [
  'Điện lạnh',
  'Giặt sấy',
  'Điều hòa không khí',
  'Điện tử nghe nhìn',
  'Thiết bị nhà bếp',
  'Xử lý nước',
  'Đồ gia dụng nhỏ',
  'Chăm sóc cá nhân',
  'Quạt và làm mát',
  'Bảo quản lạnh',
  'Thiết bị sưởi',
  'Vệ sinh gia dụng',
]

export const NHOM_SAN_PHAM_ROWS: NhomSanPham[] = NHOM_SP.map((ten, i) => ({
  id: `nhomsp-${i + 1}`,
  tenNhomSP: ten,
  active: true,
  createdAt: rng.isoDateWithin(400),
  updatedAt: rng.bool(0.25) ? rng.isoDateWithin(90) : undefined,
}))

export const nhomSanPhamApi = makeMockApi<NhomSanPham>(NHOM_SAN_PHAM_ROWS)

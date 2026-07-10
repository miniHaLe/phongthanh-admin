import { SeededRandom } from '@/lib/seeded-random'
import type { NhaKho } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { CHI_NHANH_ROWS } from './chi-nhanh.mock'

const rng = new SeededRandom(1014)

const KHOS = [
  ['Kho Chính BMT', '10 Nguyễn Tất Thành, Buôn Ma Thuột'],
  ['Kho Phụ BMT', '45 Lê Duẩn, Buôn Ma Thuột'],
  ['Kho Linh Kiện BMT', '22 Trần Phú, Buôn Ma Thuột'],
  ['Kho Chính GN', '8 Hùng Vương, Gia Nghĩa'],
  ['Kho Phụ GN', '31 Đinh Tiên Hoàng, Gia Nghĩa'],
]

export const NHA_KHO_ROWS: NhaKho[] = KHOS.map(([ten, dia], i) => ({
  id: `nk-${i + 1}`,
  maNhaKho: `NK${String(i + 1).padStart(3, '0')}`,
  tenNhaKho: ten,
  chiNhanhId: i < 3 ? CHI_NHANH_ROWS[0].id : CHI_NHANH_ROWS[1].id,
  diaChi: dia,
  // Reference "Kho xác" — the parts/carcass warehouse driving Xác inventory
  // screens. Seeded so exactly one warehouse per branch is flagged.
  khoXac: ten === 'Kho Linh Kiện BMT' || ten === 'Kho Phụ GN',
  active: rng.bool(0.9),
  createdAt: rng.isoDateWithin(500),
  updatedAt: rng.bool(0.2) ? rng.isoDateWithin(90) : undefined,
}))

export const nhaKhoApi = makeMockApi<NhaKho>(NHA_KHO_ROWS)

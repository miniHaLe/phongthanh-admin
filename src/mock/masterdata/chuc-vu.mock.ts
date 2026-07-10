import { SeededRandom } from '@/lib/seeded-random'
import type { ChucVu } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1010)

const CV_LIST: Array<[string, string]> = [
  ['Giám đốc', 'Điều hành toàn bộ hoạt động'],
  ['Phó giám đốc', 'Hỗ trợ giám đốc'],
  ['Trưởng phòng', 'Quản lý phòng ban'],
  ['Phó phòng', 'Hỗ trợ trưởng phòng'],
  ['Kỹ thuật viên trưởng', 'Kỹ thuật viên cấp cao'],
  ['Kỹ thuật viên', 'Sửa chữa thiết bị'],
  ['Nhân viên tiếp nhận', 'Tiếp nhận phiếu sửa chữa'],
  ['Nhân viên kho', 'Quản lý xuất nhập kho'],
  ['Kế toán', 'Xử lý nghiệp vụ kế toán'],
  ['Nhân viên kinh doanh', 'Bán hàng và tư vấn'],
]

export const CHUC_VU_ROWS: ChucVu[] = CV_LIST.map(([ten, moTa], i) => ({
  id: `cv-${i + 1}`,
  maChucVu: `CV${String(i + 1).padStart(3, '0')}`,
  tenChucVu: ten,
  moTa,
  active: rng.bool(0.95),
  createdAt: rng.isoDateWithin(500),
  updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
}))

export const chucVuApi = makeMockApi<ChucVu>(CHUC_VU_ROWS)

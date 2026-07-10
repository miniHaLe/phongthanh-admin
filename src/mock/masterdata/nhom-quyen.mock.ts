import { SeededRandom } from '@/lib/seeded-random'
import type { NhomQuyen } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1012)

const NQ_LIST: Array<[string, string, string]> = [
  ['NQ001', 'Quản trị hệ thống', 'Toàn quyền truy cập'],
  ['NQ002', 'Giám đốc', 'Xem và phê duyệt toàn bộ'],
  ['NQ003', 'Kế toán', 'Quản lý tài chính, hóa đơn'],
  ['NQ004', 'Kỹ thuật viên', 'Xử lý phiếu sửa chữa'],
  ['NQ005', 'Tiếp nhận', 'Tạo và xem phiếu sửa chữa'],
  ['NQ006', 'Nhân viên kho', 'Quản lý nhập xuất kho'],
  ['NQ007', 'Nhân viên kinh doanh', 'Bán hàng và khách hàng'],
  ['NQ008', 'Xem báo cáo', 'Chỉ xem báo cáo'],
]

export const NHOM_QUYEN_ROWS: NhomQuyen[] = NQ_LIST.map(
  ([ma, ten, moTa], i) => ({
    id: `nq-${i + 1}`,
    maNhom: ma,
    tenNhom: ten,
    moTa,
    active: rng.bool(0.95),
    createdAt: rng.isoDateWithin(500),
    updatedAt: rng.bool(0.2) ? rng.isoDateWithin(90) : undefined,
  }),
)

export const nhomQuyenApi = makeMockApi<NhomQuyen>(NHOM_QUYEN_ROWS)

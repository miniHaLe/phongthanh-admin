import { SeededRandom } from '@/lib/seeded-random'
import { makeMockApi } from '@/mock/masterdata'
import type { NganHang } from './types'

const rng = new SeededRandom(9001)

const NGAN_HANG_LIST: Array<[string, string, string]> = [
  ['VCB', 'Vietcombank', '198 Trần Quang Khải, Hà Nội'],
  ['BIDV', 'BIDV', '35 Hàng Vôi, Hà Nội'],
  ['VTB', 'Vietinbank', '108 Trần Hưng Đạo, Hà Nội'],
  ['ACB', 'Á Châu (ACB)', '442 Nguyễn Thị Minh Khai, TP.HCM'],
  ['TCB', 'Techcombank', '191 Bà Triệu, Hà Nội'],
  ['MB', 'Quân Đội (MB Bank)', '18 Lê Văn Lương, Hà Nội'],
  ['SACOM', 'Sacombank', '266-268 Nam Kỳ Khởi Nghĩa, TP.HCM'],
  ['AGRI', 'Agribank', '2 Láng Hạ, Hà Nội'],
]

export const NGAN_HANG_ROWS: NganHang[] = NGAN_HANG_LIST.map(
  ([ma, ten, diaChi], i) => ({
    id: `ngh-${i + 1}`,
    maNganHang: ma,
    tenNganHang: ten,
    diaChi,
    active: true,
    createdAt: rng.isoDateWithin(500),
    updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
  }),
)

export const nganHangApi = makeMockApi<NganHang>(NGAN_HANG_ROWS)

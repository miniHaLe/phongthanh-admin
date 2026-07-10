/**
 * News feed derived from the live repair layer (D5). Title pattern
 * `{n}. {TÊN NSX}, {phieuCode}` matches the reference sample
 * "1. SUPOR, 20180829-8200". Deterministic (SeededRandom seed 5002).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { MANUFACTURERS } from '@/domains/repair/reference-data'

export interface NewsItem {
  id: string
  title: string
  author: string
  at: string // ISO
  body: string
  repairId?: string
}

const rng = new SeededRandom(5002)
const AUTHORS = ['Quản trị viên', 'Phòng kỹ thuật', 'Bộ phận CSKH']
const BODIES = [
  'Phiếu đã được cập nhật trạng thái mới. Vui lòng kiểm tra chi tiết.',
  'Linh kiện thay thế đã về kho, kỹ thuật viên có thể tiếp tục xử lý.',
  'Khách hàng đã được thông báo về tình trạng sửa chữa.',
  'Yêu cầu bảo hành đã được duyệt và chuyển sang bước tiếp theo.',
]

function buildNews(): NewsItem[] {
  const source = MOCK_TICKETS.slice(0, 10)
  return source.map((t, i) => {
    const nsx = rng.pick(MANUFACTURERS)
    return {
      id: `news-${String(i + 1).padStart(3, '0')}`,
      title: `${i + 1}. ${nsx.ten.toUpperCase()}, ${t.soPhieu}`,
      author: rng.pick(AUTHORS),
      at: t.updatedAt,
      body: rng.pick(BODIES),
      repairId: t.id,
    }
  })
}

export const NEWS: NewsItem[] = buildNews()

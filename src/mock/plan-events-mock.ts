/**
 * Seeded plan events for the dashboard "Kế hoạch của bạn" calendar. Events land
 * in the current month; the reference default event color is #f39c12.
 * Deterministic (SeededRandom seed 5003) — but day-of-month is spread across a
 * fixed 1-28 range so no wall-clock affects the seed.
 */
import { SeededRandom } from '@/lib/seeded-random'

export interface PlanEvent {
  id: string
  day: number // 1-28, mapped onto the displayed month
  title: string
  color: string
}

const rng = new SeededRandom(5003)

const TITLES = [
  'Bảo trì định kỳ máy lạnh',
  'Giao hàng khách VIP',
  'Kiểm kê kho linh kiện',
  'Họp kỹ thuật đầu tuần',
  'Lắp đặt tại nhà khách',
  'Thu hồi linh kiện lỗi',
  'Đào tạo nhân viên mới',
]
const COLORS = ['#f39c12', '#27ae60', '#2980b9', '#c0392b', '#8e44ad']

function buildEvents(): PlanEvent[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `plan-${i + 1}`,
    day: rng.int(1, 28),
    title: rng.pick(TITLES),
    // Default color #f39c12 weighted higher, per the reference.
    color: rng.bool(0.4) ? '#f39c12' : rng.pick(COLORS),
  }))
}

export const PLAN_EVENTS: PlanEvent[] = buildEvents()

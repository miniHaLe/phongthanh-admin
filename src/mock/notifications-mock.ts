/**
 * Notification feed (RepairingStatusHistory analog) derived from the live
 * repair layer (MOCK_TICKETS, D5). Each item is a status-change event carrying
 * the phiếu code, a legacy status id (for coloring), the changer, and a
 * timestamp. Deterministic (SeededRandom seed 5001).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { REPAIR_STATUS_IDS, type RepairStatusId } from '@/domains/repair/status'

export interface NotificationItem {
  id: string
  repairId: string
  phieuCode: string
  statusId: RepairStatusId
  changedBy: string
  at: string // ISO
}

const rng = new SeededRandom(5001)
const CHANGERS = [
  'Nguyễn Văn An',
  'Trần Minh Đức',
  'Lê Hoàng Nam',
  'Phạm Thị Hoa',
  'Đỗ Quang Huy',
]

function buildNotifications(): NotificationItem[] {
  const source = MOCK_TICKETS.slice(0, 20)
  return source.map((t, i) => ({
    id: `notif-${String(i + 1).padStart(3, '0')}`,
    repairId: t.id,
    phieuCode: t.soPhieu,
    statusId: rng.pick(REPAIR_STATUS_IDS),
    changedBy: rng.pick(CHANGERS),
    at: t.updatedAt,
  }))
}

export const NOTIFICATIONS: NotificationItem[] = buildNotifications()

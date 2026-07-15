/**
 * Dashboard mock queries. Repair metrics read the same mutable MOCK_TICKETS
 * store as the list, KT board, and detail page; inventory keeps its own seed.
 */

import { SeededRandom } from '@/lib/seeded-random'
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow } from '@/lib/mock-error'
import {
  REPAIR_STATUS_IDS,
  OPEN_STATUS_IDS,
  STATUS_LABEL,
  type RepairStatusId,
} from '@/domains/repair/status'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { BRANCHES, BRANCH_NAME, type BranchId } from '@/mock/seed/branches'
import type {
  DashboardSummary,
  LowStockItem,
  RecentTicket,
  StatusCount,
  BranchCount,
  QueueCount,
} from '@/types/dashboard-types'

// ── Static seeded data ────────────────────────────────────────────────────────

const PART_NAMES = [
  'Màn hình LCD iPhone 15',
  'Pin Samsung S24',
  'Bàn phím MacBook Pro',
  'Loa ngoài Oppo Reno',
  'Nắp lưng Xiaomi 14',
  'Cổng sạc USB-C Dell',
  'Camera trước iPad',
  'Loa trong iPhone 14',
  'Màn hình Samsung A54',
  'Pin Realme 12',
  'Kính cường lực iPad',
  'Cáp flex màn hình Lenovo',
  'Nút nguồn Surface',
  'Cảm biến vân tay Oppo',
  'Ăng ten WiFi MacBook',
] as const

const WAREHOUSE_NAMES = ['Kho chính Đắk Lắk', 'Kho chính Đắk Nông'] as const

const SEED = 42
const REMOVED_TICKET_RANDOM_DRAWS = 387
const rng = new SeededRandom(SEED)
// Keep the inventory sequence stable after removing the former 50-ticket seed.
for (let draw = 0; draw < REMOVED_TICKET_RANDOM_DRAWS; draw++) rng.float()

/** Build the 15-part seeded low-stock dataset. */
interface PartRecord {
  partId: string
  partName: string
  warehouseName: string
  currentQty: number
  reorderLevel: number
}

function buildParts(): PartRecord[] {
  const parts: PartRecord[] = []
  for (let i = 0; i < PART_NAMES.length; i++) {
    const reorderLevel = rng.int(3, 10)
    // ~40% chance to be below reorder level
    const currentQty = rng.bool(0.4)
      ? rng.int(0, reorderLevel - 1)
      : rng.int(reorderLevel, reorderLevel + 15)
    parts.push({
      partId: `part-${i + 1}`,
      partName: PART_NAMES[i],
      warehouseName: rng.pick(WAREHOUSE_NAMES),
      currentQty,
      reorderLevel,
    })
  }
  return parts
}

const ALL_PARTS: PartRecord[] = buildParts()

// ── The 4 "work-queue" statuses shown in dashboard tiles ─────────────────────
// Mới Nhận / Đã Điều Phối / Chờ Linh Kiện / Sửa Xong.
const QUEUE_STATUSES: RepairStatusId[] = [1, 2, 7, 9]

// ── Yesterday snapshot for trend calculation (offset seed by 1) ─────────────

const rngYesterday = new SeededRandom(SEED + 1)

function buildYesterdayQueue(): Record<RepairStatusId, number> {
  const counts: Partial<Record<RepairStatusId, number>> = {}
  // Approximate counts via a shifted random
  for (const id of REPAIR_STATUS_IDS) {
    counts[id] = rngYesterday.int(0, 8)
  }
  return counts as Record<RepairStatusId, number>
}

const YESTERDAY_QUEUE = buildYesterdayQueue()
const YESTERDAY_RECEIPTS = rngYesterday.int(1, 6)

const BRANCH_IDS = new Set<string>(BRANCHES.map((branch) => branch.id))

function toBranchId(branchId: string): BranchId {
  if (!BRANCH_IDS.has(branchId)) {
    throw new Error(`Unknown repair branch: ${branchId}`)
  }
  return branchId as BranchId
}

// ── Mock API functions ────────────────────────────────────────────────────────

/** Returns dashboard summary filtered by branchId. 'all' returns aggregate. */
export async function fetchDashboardSummary(
  branchId: BranchId | 'all',
): Promise<DashboardSummary> {
  await mockDelay(400, 200)
  maybeThrow(0)

  const filtered =
    branchId === 'all'
      ? MOCK_TICKETS
      : MOCK_TICKETS.filter((t) => t.branchId === branchId)

  // Count by status
  const countByStatus = new Map<RepairStatusId, number>()
  for (const t of filtered) {
    countByStatus.set(t.tinhTrang, (countByStatus.get(t.tinhTrang) ?? 0) + 1)
  }

  // Queue tiles (4 key statuses)
  const queue: QueueCount[] = QUEUE_STATUSES.map((s) => ({
    status: s,
    count: countByStatus.get(s) ?? 0,
    trend: (countByStatus.get(s) ?? 0) - YESTERDAY_QUEUE[s],
  }))

  // Today receipts — tickets within last 24h
  const oneDayAgo = Date.now() - 86_400_000
  const todayTickets = filtered.filter(
    (t) => new Date(t.ngayNhan).getTime() > oneDayAgo,
  )
  const todayReceipts = todayTickets.length
  const todayReceiptsTrend = todayReceipts - YESTERDAY_RECEIPTS

  // Per-branch counts
  const openStatusSet = new Set<RepairStatusId>(OPEN_STATUS_IDS)
  const branches: BranchCount[] = BRANCHES.map((b) => {
    const branchTickets = MOCK_TICKETS.filter((t) => t.branchId === b.id)
    const openCount = branchTickets.filter((t) =>
      openStatusSet.has(t.tinhTrang),
    ).length
    // Overdue is a seeded field — no wall-clock compare.
    const overdueCount = branchTickets.filter((t) => t.isOverdue).length
    return {
      branchId: b.id,
      branchName: BRANCH_NAME[b.id],
      openCount,
      overdueCount,
    }
  })

  return { queue, todayReceipts, todayReceiptsTrend, branches }
}

/** Returns parts below their reorder level. */
export async function fetchLowStock(): Promise<LowStockItem[]> {
  await mockDelay(300, 150)
  maybeThrow(0)

  return ALL_PARTS.filter((p) => p.currentQty < p.reorderLevel).map((p) => ({
    partId: p.partId,
    partName: p.partName,
    warehouseName: p.warehouseName,
    currentQty: p.currentQty,
    reorderLevel: p.reorderLevel,
  }))
}

/** Returns the most recent 10 tickets (branch-independent for this view). */
export async function fetchRecentTickets(): Promise<RecentTicket[]> {
  await mockDelay(350, 150)
  maybeThrow(0)

  return [...MOCK_TICKETS]
    .sort(
      (a, b) =>
        new Date(b.ngayNhan).getTime() - new Date(a.ngayNhan).getTime() ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      ticketCode: t.soPhieu,
      customerName: t.khachHang.ten,
      productName: t.tenSanPham,
      technicianName: t.kyThuat,
      status: t.tinhTrang,
      receivedDate: t.ngayNhan,
      branchId: toBranchId(t.branchId),
    }))
}

/** Returns ticket counts per status, with hex fill for Recharts. */
export async function fetchStatusDistribution(): Promise<StatusCount[]> {
  await mockDelay(300, 150)
  maybeThrow(0)

  const countByStatus = new Map<RepairStatusId, number>()
  for (const t of MOCK_TICKETS) {
    countByStatus.set(t.tinhTrang, (countByStatus.get(t.tinhTrang) ?? 0) + 1)
  }

  // Fill color is applied at render from STATUS_HEX[status] (fixed legacy hex).
  return REPAIR_STATUS_IDS.filter((id) => (countByStatus.get(id) ?? 0) > 0).map(
    (id) => ({
      status: id,
      label: STATUS_LABEL[id],
      count: countByStatus.get(id) ?? 0,
    }),
  )
}

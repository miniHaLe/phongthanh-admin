/**
 * Dashboard mock data generators (Phase 3, C4).
 * All randomness via SeededRandom — NO Math.random in module scope.
 * Accepts branchId | 'all' for summary queries.
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

const CUSTOMER_NAMES = [
  'Nguyễn Văn An',
  'Trần Thị Bình',
  'Lê Minh Châu',
  'Phạm Đức Dũng',
  'Hoàng Thị Lan',
  'Vũ Văn Hùng',
  'Đặng Thị Mai',
  'Bùi Quốc Nam',
  'Đỗ Thị Oanh',
  'Ngô Xuân Phong',
  'Lý Thị Quý',
  'Trịnh Văn Sơn',
  'Dương Thị Tâm',
  'Đinh Văn Uy',
  'Võ Thị Vân',
] as const

const PRODUCT_NAMES = [
  'iPhone 15 Pro Max',
  'Samsung Galaxy S24 Ultra',
  'MacBook Pro 14"',
  'iPad Pro 12.9"',
  'Oppo Reno 11',
  'Xiaomi 14 Pro',
  'Realme 12 Pro+',
  'ASUS ZenFone 10',
  'Dell XPS 15',
  'Lenovo ThinkPad X1',
  'HP EliteBook 840',
  'Surface Pro 9',
  'Sony Xperia 1 V',
  'Google Pixel 8 Pro',
  'OnePlus 12',
] as const

const TECHNICIAN_NAMES = [
  'Nguyễn Kỹ Thuật',
  'Trần Văn Tài',
  'Lê Thị Hoa',
  'Phạm Sửa Chữa',
  'Hoàng Văn Bảo',
] as const

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

/** Build the 50-ticket seeded dataset once at module load. */
const SEED = 42
const rng = new SeededRandom(SEED)

interface TicketRecord {
  id: string
  ticketCode: string
  customerName: string
  productName: string
  technicianName: string
  status: RepairStatusId
  /** Seeded SLA-overdue flag (no wall clock). */
  isOverdue: boolean
  receivedDate: string
  branchId: BranchId
}

/** Finished statuses never count as overdue. */
const FINISHED_STATUS_IDS: readonly RepairStatusId[] = [9, 10, 12]

function buildTickets(): TicketRecord[] {
  const tickets: TicketRecord[] = []
  const branchIds: BranchId[] = ['dak-lak', 'dak-nong']

  // Status weight distribution over the legacy 15 ids — realistic shop queue.
  const statusWeightById: Record<RepairStatusId, number> = {
    1: 8,
    2: 6,
    4: 4,
    6: 3,
    7: 5,
    8: 2,
    9: 4,
    10: 5,
    11: 1,
    12: 1,
    13: 3,
    14: 1,
    15: 4,
    16: 2,
    17: 3,
  }
  const statusWeights: number[] = REPAIR_STATUS_IDS.map(
    (id) => statusWeightById[id],
  )

  for (let i = 0; i < 50; i++) {
    const idx = String(412 + i).padStart(5, '0')
    const year = 2024
    const status = rng.weighted(REPAIR_STATUS_IDS, statusWeights)
    tickets.push({
      id: `ticket-${i + 1}`,
      ticketCode: `SC-${year}-${idx}`,
      customerName: rng.pick(CUSTOMER_NAMES),
      productName: rng.pick(PRODUCT_NAMES),
      technicianName: rng.pick(TECHNICIAN_NAMES),
      status,
      isOverdue: !FINISHED_STATUS_IDS.includes(status) && rng.bool(0.2),
      receivedDate: rng.isoDateWithin(60),
      branchId: rng.pick(branchIds),
    })
  }

  // Sort by receivedDate desc (newest first)
  return tickets.sort(
    (a, b) =>
      new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime(),
  )
}

const ALL_TICKETS: TicketRecord[] = buildTickets()

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

// ── Mock API functions ────────────────────────────────────────────────────────

/** Returns dashboard summary filtered by branchId. 'all' returns aggregate. */
export async function fetchDashboardSummary(
  branchId: BranchId | 'all',
): Promise<DashboardSummary> {
  await mockDelay(400, 200)
  maybeThrow(0)

  const filtered =
    branchId === 'all'
      ? ALL_TICKETS
      : ALL_TICKETS.filter((t) => t.branchId === branchId)

  // Count by status
  const countByStatus = new Map<RepairStatusId, number>()
  for (const t of filtered) {
    countByStatus.set(t.status, (countByStatus.get(t.status) ?? 0) + 1)
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
    (t) => new Date(t.receivedDate).getTime() > oneDayAgo,
  )
  const todayReceipts = todayTickets.length
  const todayReceiptsTrend = todayReceipts - rngYesterday.int(1, 6)

  // Per-branch counts
  const openStatusSet = new Set<RepairStatusId>(OPEN_STATUS_IDS)
  const branches: BranchCount[] = BRANCHES.map((b) => {
    const branchTickets = ALL_TICKETS.filter((t) => t.branchId === b.id)
    const openCount = branchTickets.filter((t) =>
      openStatusSet.has(t.status),
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

  return ALL_TICKETS.slice(0, 10).map((t) => ({
    id: t.id,
    ticketCode: t.ticketCode,
    customerName: t.customerName,
    productName: t.productName,
    technicianName: t.technicianName,
    status: t.status,
    receivedDate: t.receivedDate,
    branchId: t.branchId,
  }))
}

/** Returns ticket counts per status, with hex fill for Recharts. */
export async function fetchStatusDistribution(): Promise<StatusCount[]> {
  await mockDelay(300, 150)
  maybeThrow(0)

  const countByStatus = new Map<RepairStatusId, number>()
  for (const t of ALL_TICKETS) {
    countByStatus.set(t.status, (countByStatus.get(t.status) ?? 0) + 1)
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

/**
 * Dashboard domain types (Phase 3).
 * All status references use canonical RepairStatusId from C2 — no local enums.
 */

import type { RepairStatusId } from '@/domains/repair/status'
import type { BranchId } from '@/mock/seed/branches'

/** Counts for a single queue-status tile on the dashboard. */
export interface QueueCount {
  /** Canonical status id (C2). */
  status: RepairStatusId
  /** Count of tickets with this status (branch-filtered). */
  count: number
  /** Delta vs same time yesterday (may be negative). */
  trend: number
}

export interface BranchCount {
  branchId: BranchId
  branchName: string
  /** Tickets in any open (non-delivered/non-cancelled) status. */
  openCount: number
  /** Tickets flagged overdue (seeded field). */
  overdueCount: number
}

export interface DashboardSummary {
  /** 4 key statuses used in the work-queue tile row. */
  queue: QueueCount[]
  /** Tickets received today. */
  todayReceipts: number
  /** Delta vs yesterday. */
  todayReceiptsTrend: number
  branches: BranchCount[]
}

export interface LowStockItem {
  partId: string
  partName: string
  warehouseName: string
  currentQty: number
  reorderLevel: number
}

export interface RecentTicket {
  id: string
  /** e.g. "SC-2024-00412" */
  ticketCode: string
  customerName: string
  productName: string
  technicianName: string
  status: RepairStatusId
  /** ISO date string */
  receivedDate: string
  branchId: BranchId
}

export interface StatusCount {
  status: RepairStatusId
  label: string
  count: number
}

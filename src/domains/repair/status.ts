/**
 * CANONICAL repair-status module (Cross-Cutting Convention C2).
 *
 * The ONE source of truth for repair statuses across the whole app.
 * Consuming phases import from here — they must NOT redefine the status set.
 *
 * Vocabulary: the legacy 15 statuses with FIXED numeric ids and hex colors
 * (mirrored from the reference app's /ReportStatusTechnician). Ids are a numeric
 * union so they serialize cleanly in URL filters. The reference has no dark mode:
 * each hex is a single fixed value used in both themes.
 */

// ── Numeric id union (fixed by the reference — ids 3 and 5 do not exist) ─────
export type RepairStatusId =
  | 1
  | 2
  | 4
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17

export interface RepairStatusDef {
  id: RepairStatusId
  label: string
  hex: string
}

// ── The 15 legacy statuses in id order (labels + hex are byte-exact, §5b) ────
export const REPAIR_STATUSES: readonly RepairStatusDef[] = [
  { id: 1, label: 'Mới Nhận', hex: '#FFCC00' },
  { id: 2, label: 'Đã Điều Phối', hex: '#00CCFF' },
  { id: 4, label: 'Báo Giá', hex: '#9966CC' },
  { id: 6, label: 'Chờ Xác Nhận', hex: '#996600' },
  { id: 7, label: 'Chờ Linh Kiện', hex: '#4B0082' },
  { id: 8, label: 'Trả Lại', hex: '#CC3300' },
  { id: 9, label: 'Sửa Xong', hex: '#3300FF' },
  { id: 10, label: 'Đã Giao Cho Khách', hex: '#00FF00' },
  { id: 11, label: 'Hỏng Khách Trả Lại', hex: '#CC9911' },
  { id: 12, label: 'Đã Giao Phiếu Hủy', hex: '#342c38' },
  { id: 13, label: 'Đã Có Linh Kiện', hex: '#6D5582' },
  { id: 14, label: 'Đã Giao Ngoài', hex: '#009988' },
  { id: 15, label: 'Chờ Báo Giá', hex: '#31065c' },
  { id: 16, label: 'Chờ Phiếu Hãng', hex: '#06385c' },
  { id: 17, label: 'Đã Đặt Linh Kiện', hex: '#112233' },
] as const

/** All valid ids in id order. */
export const REPAIR_STATUS_IDS: readonly RepairStatusId[] = REPAIR_STATUSES.map(
  (s) => s.id,
)

/** Vietnamese label per status id. */
export const STATUS_LABEL: Record<RepairStatusId, string> = Object.fromEntries(
  REPAIR_STATUSES.map((s) => [s.id, s.label]),
) as Record<RepairStatusId, string>

/** Fixed hex color per status id (single value; used in both light/dark). */
export const STATUS_HEX: Record<RepairStatusId, string> = Object.fromEntries(
  REPAIR_STATUSES.map((s) => [s.id, s.hex]),
) as Record<RepairStatusId, string>

/**
 * KT-board membership subset (which statuses appear on the technician board).
 * This is a SET (membership) in ascending id order — distinct from any
 * display-order constant a later phase may define. Never deep-equal the two.
 */
export const KT_BOARD_STATUS_IDS: readonly RepairStatusId[] = [
  2, 4, 6, 7, 8, 9, 13, 15, 16, 17,
]

/**
 * Repair-list legend / status-filter display order (presentation only —
 * distinct from the id-ordered REPAIR_STATUSES). Never deep-equal against the
 * id order or the KT board set.
 */
export const REPAIR_STATUS_DISPLAY_ORDER: readonly RepairStatusId[] = [
  1, 2, 4, 15, 6, 17, 13, 7, 8, 11, 16, 9, 10, 12, 14,
]

/**
 * Repair-list "open" default filter: every status except 10 (Đã Giao Cho Khách)
 * and 12 (Đã Giao Phiếu Hủy). Transitional array default — P3 pins the exact set
 * against the Index_8 reference default filter.
 */
export const OPEN_STATUS_IDS: readonly RepairStatusId[] = REPAIR_STATUS_IDS.filter(
  (id) => id !== 10 && id !== 12,
)

// ── Helpers ──────────────────────────────────────────────────────────────
export function labelOf(id: RepairStatusId): string {
  return STATUS_LABEL[id] ?? String(id)
}

export function hexOf(id: RepairStatusId): string {
  return STATUS_HEX[id] ?? '#999999'
}

/** True if `id` is one of the 15 canonical status ids. */
export function isRepairStatusId(id: unknown): id is RepairStatusId {
  return typeof id === 'number' && id in STATUS_LABEL
}

/**
 * Parse an unknown value (URL param, saved-view slug) into a valid status id,
 * or null if it is not one of the 15. Callers fall back to OPEN_STATUS_IDS so a
 * stale snake slug never yields a silent zero-row view.
 */
export function parseStatusId(value: unknown): RepairStatusId | null {
  const n = typeof value === 'number' ? value : Number(value)
  return isRepairStatusId(n) ? n : null
}

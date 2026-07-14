import type { RepairStatusId } from '@/domains/repair/status'

export const REPAIR_KT_BREADCRUMB_LABEL = 'Sửa Chữa-Bảo Hành KT'

/** KT filter presentation order; membership remains canonical status data. */
export const KT_DISPLAY_ORDER: readonly RepairStatusId[] = [
  2, 4, 15, 6, 7, 13, 17, 16, 8, 9,
]

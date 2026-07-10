/**
 * Mock delete-mutation for the Bán Hàng bulk toolbar. Splices matching ids out
 * of the already-exported, mutable `SELLING_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified).
 * Module-memory only; lost on reload like every other mock mutation.
 */
import { SELLING_ROWS } from '@/domains/warehouse/list-data'

export function deleteSellingOrders(ids: string[]): number {
  const set = new Set(ids)
  let removed = 0
  for (let i = SELLING_ROWS.length - 1; i >= 0; i--) {
    if (set.has(SELLING_ROWS[i].id)) {
      SELLING_ROWS.splice(i, 1)
      removed++
    }
  }
  return removed
}

/** D4 reconciliation: `khach_hang` fixture rows carry no branch field. Derive
 * `branch_id` at seed time from `tinhId` per the plan's locked map. Any
 * `tinhId` outside this map is a fixture-integrity bug — fail loud, don't
 * default to a guess. */
const TINH_TO_BRANCH: Record<string, string> = {
  'tinh-dak-lak': 'cn-1',
  'tinh-dak-nong': 'cn-2',
}

export function branchIdForTinh(tinhId: string | undefined | null): string {
  if (!tinhId) {
    throw new Error(
      `Không thể xác định chi nhánh: khách hàng thiếu tinhId (branch derivation requires tinhId)`,
    )
  }
  const branchId = TINH_TO_BRANCH[tinhId]
  if (!branchId) {
    throw new Error(
      `Không thể xác định chi nhánh cho tinhId="${tinhId}" (no mapping in TINH_TO_BRANCH)`,
    )
  }
  return branchId
}

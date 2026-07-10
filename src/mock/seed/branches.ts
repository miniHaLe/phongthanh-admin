/**
 * Branch reference data (C7). `all` is a UI-only aggregate selector value,
 * NOT a stored branch. The two real branches are dak-lak and dak-nong.
 */
export type BranchId = 'dak-lak' | 'dak-nong' | 'ctv-tuyen-huyen'

export interface Branch {
  id: BranchId
  name: string
}

export const BRANCHES: Branch[] = [
  { id: 'dak-lak', name: 'Đắk Lắk' },
  { id: 'dak-nong', name: 'Đắk Nông' },
  { id: 'ctv-tuyen-huyen', name: 'Cộng tác viên tuyến huyện' },
]

export const BRANCH_NAME: Record<BranchId, string> = {
  'dak-lak': 'Đắk Lắk',
  'dak-nong': 'Đắk Nông',
  'ctv-tuyen-huyen': 'Cộng tác viên tuyến huyện',
}

/** Resolve any branch selection (incl. 'all') to a display label. */
export function branchLabel(id: BranchId | 'all'): string {
  return id === 'all' ? 'Tất cả chi nhánh' : BRANCH_NAME[id]
}

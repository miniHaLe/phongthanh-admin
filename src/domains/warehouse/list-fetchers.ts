/**
 * List fetchers for the warehouse + stock-out voucher/slip lists. Thin
 * filter + paginate wrappers over the seeded row stores (D5 live layer).
 */
import { mockDelay } from '@/lib/mock-delay'
import { paginate } from './mock-data'
import {
  RECEIVING_ROWS,
  CHECKOUT_ROWS,
  SELLING_ROWS,
  RETURN_ROWS,
  MOVING_ROWS,
  ISSUED_USAGE_ROWS,
  PART_RETURN_ROWS,
  PART_RETURN_XAC_ROWS,
} from './list-data'
import type { WarehouseListResult } from './types'

interface BaseListParams {
  branchId?: string
  soPhieu?: string
  page?: number
  pageSize?: number
}

function byBranch<T extends { branchId: string }>(
  rows: T[],
  branchId?: string,
): T[] {
  return branchId ? rows.filter((r) => r.branchId === branchId) : rows
}

export async function fetchReceivingList(p: BaseListParams = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(RECEIVING_ROWS, p.branchId)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter((r) => r.soPhieu.toLowerCase().includes(q))
  }
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchCheckoutList(p: BaseListParams = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(CHECKOUT_ROWS, p.branchId)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter((r) => r.soPhieuCap.toLowerCase().includes(q))
  }
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchSellingList(p: BaseListParams = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(SELLING_ROWS, p.branchId)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter((r) => r.soPhieu.toLowerCase().includes(q))
  }
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchReturnList(p: BaseListParams & { hinhThucTra?: string } = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(RETURN_ROWS, p.branchId)
  if (p.hinhThucTra) rows = rows.filter((r) => r.hinhThucTra === p.hinhThucTra)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter((r) => r.soPhieu.toLowerCase().includes(q))
  }
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchMovingList(p: BaseListParams & { trangThai?: string } = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(MOVING_ROWS, p.branchId)
  if (p.trangThai) rows = rows.filter((r) => r.trangThai === p.trangThai)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter((r) => r.soPhieu.toLowerCase().includes(q))
  }
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchIssuedUsageList(
  p: BaseListParams & { tinhTrang?: string; mucDich?: string } = {},
): Promise<WarehouseListResult<(typeof ISSUED_USAGE_ROWS)[number]>> {
  await mockDelay(300, 150)
  let rows = byBranch(ISSUED_USAGE_ROWS, p.branchId)
  if (p.tinhTrang) rows = rows.filter((r) => r.tinhTrang === p.tinhTrang)
  if (p.mucDich) rows = rows.filter((r) => r.mucDich === p.mucDich)
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchPartReturnList(
  p: BaseListParams & { tinhTrang?: string; hinhThuc?: string } = {},
): Promise<WarehouseListResult<(typeof PART_RETURN_ROWS)[number]>> {
  await mockDelay(300, 150)
  let rows = byBranch(PART_RETURN_ROWS, p.branchId)
  if (p.tinhTrang) rows = rows.filter((r) => r.tinhTrang === p.tinhTrang)
  if (p.hinhThuc) rows = rows.filter((r) => r.hinhThuc === p.hinhThuc)
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchPartReturnXacList(
  p: BaseListParams & { tinhTrang?: string; maVanDon?: string } = {},
): Promise<WarehouseListResult<(typeof PART_RETURN_XAC_ROWS)[number]>> {
  await mockDelay(300, 150)
  let rows = byBranch(PART_RETURN_XAC_ROWS, p.branchId)
  if (p.tinhTrang) rows = rows.filter((r) => r.tinhTrang === p.tinhTrang)
  if (p.maVanDon) {
    const q = p.maVanDon.toLowerCase()
    rows = rows.filter((r) => r.maVanDon.toLowerCase().includes(q))
  }
  return paginate(rows, p.page, p.pageSize)
}

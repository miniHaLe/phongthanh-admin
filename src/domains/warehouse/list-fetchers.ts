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

export interface ReceivingListParams extends BaseListParams {
  hinhThucThanhToan?: string
  khoId?: string
  nganChuaId?: string
  soDatHangHoaDon?: string
  maSanPham?: string
  nhaCungCap?: string
  nguoiLap?: string
  dateFrom?: string
  dateTo?: string
}

export interface CheckoutListParams extends BaseListParams {
  kyThuat?: string
  khoId?: string
  mucDich?: string
  soPhieuSC?: string
  maSanPham?: string
  nsx?: string
  dateFrom?: string
  dateTo?: string
}

export interface SellingListParams extends BaseListParams {
  khoId?: string
  hinhThucThanhToan?: string
  tenKhachHang?: string
  maHang?: string
  dateFrom?: string
  dateTo?: string
}

function byBranch<T extends { branchId: string }>(
  rows: T[],
  branchId?: string,
): T[] {
  return branchId ? rows.filter((r) => r.branchId === branchId) : rows
}

export async function fetchReceivingList(p: ReceivingListParams = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(RECEIVING_ROWS, p.branchId)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter((r) => r.soPhieu.toLowerCase().includes(q))
  }
  if (p.hinhThucThanhToan)
    rows = rows.filter(
      (r) => r.hinhThucThanhToan === p.hinhThucThanhToan,
    )
  if (p.khoId) rows = rows.filter((r) => r.khoId === p.khoId)
  if (p.soDatHangHoaDon) {
    const q = p.soDatHangHoaDon.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.soDatHang.toLowerCase().includes(q) ||
        r.soHoaDon.toLowerCase().includes(q),
    )
  }
  const receivingProductQuery = p.maSanPham?.toLowerCase()
  if (p.nganChuaId || receivingProductQuery) {
    rows = rows.filter((r) =>
      r.lines.some((line) => {
        if (p.nganChuaId && line.nganChuaId !== p.nganChuaId) return false
        if (
          receivingProductQuery &&
          !line.ma.toLowerCase().includes(receivingProductQuery)
        )
          return false
        return true
      }),
    )
  }
  if (p.nhaCungCap) {
    const q = p.nhaCungCap.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.nhaCungCap.toLowerCase().includes(q) ||
        r.nhaCungCapSdt.includes(q),
    )
  }
  if (p.nguoiLap) {
    const q = p.nguoiLap.toLowerCase()
    rows = rows.filter((r) => r.nguoiLap.toLowerCase().includes(q))
  }
  const { dateFrom, dateTo } = p
  if (dateFrom)
    rows = rows.filter((r) => r.ngayLap.slice(0, 10) >= dateFrom)
  if (dateTo) rows = rows.filter((r) => r.ngayLap.slice(0, 10) <= dateTo)
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchCheckoutList(p: CheckoutListParams = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(CHECKOUT_ROWS, p.branchId)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter((r) => r.soPhieuCap.toLowerCase().includes(q))
  }
  if (p.kyThuat) rows = rows.filter((r) => r.kyThuat === p.kyThuat)
  const { dateFrom, dateTo } = p
  if (dateFrom)
    rows = rows.filter((r) => r.ngayLap.slice(0, 10) >= dateFrom)
  if (dateTo) rows = rows.filter((r) => r.ngayLap.slice(0, 10) <= dateTo)
  const repairTicketQuery = p.soPhieuSC?.toLowerCase()
  const checkoutProductQuery = p.maSanPham?.toLowerCase()
  const manufacturerQuery = p.nsx?.toLowerCase()
  if (
    p.khoId ||
    p.mucDich ||
    repairTicketQuery ||
    checkoutProductQuery ||
    manufacturerQuery
  ) {
    rows = rows.filter((r) =>
      r.lines.some((line) => {
        if (p.khoId && line.khoId !== p.khoId) return false
        if (p.mucDich && line.mucDich !== p.mucDich) return false
        if (
          repairTicketQuery &&
          !line.soPhieuSC.toLowerCase().includes(repairTicketQuery)
        )
          return false
        if (
          checkoutProductQuery &&
          !line.maHang.toLowerCase().includes(checkoutProductQuery)
        )
          return false
        if (
          manufacturerQuery &&
          !line.nhaSanXuat.toLowerCase().includes(manufacturerQuery)
        )
          return false
        return true
      }),
    )
  }
  return paginate(rows, p.page, p.pageSize)
}

export async function fetchSellingList(p: SellingListParams = {}) {
  await mockDelay(300, 150)
  let rows = byBranch(SELLING_ROWS, p.branchId)
  if (p.soPhieu) {
    const q = p.soPhieu.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.soPhieu.toLowerCase().includes(q) ||
        r.ghiChu.toLowerCase().includes(q),
    )
  }
  if (p.hinhThucThanhToan)
    rows = rows.filter(
      (r) => r.hinhThucThanhToan === p.hinhThucThanhToan,
    )
  if (p.tenKhachHang) {
    const q = p.tenKhachHang.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.khachHang.toLowerCase().includes(q) || r.dienThoai.includes(q),
    )
  }
  const productQuery = p.maHang?.toLowerCase()
  if (p.khoId || productQuery) {
    rows = rows.filter((r) =>
      r.lines.some((line) => {
        if (p.khoId && line.khoId !== p.khoId) return false
        if (
          productQuery &&
          !`${line.maHang} ${line.tenHang}`.toLowerCase().includes(productQuery)
        )
          return false
        return true
      }),
    )
  }
  if (p.dateFrom)
    rows = rows.filter((r) => r.ngayLap.slice(0, 10) >= p.dateFrom!)
  if (p.dateTo)
    rows = rows.filter((r) => r.ngayLap.slice(0, 10) <= p.dateTo!)
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

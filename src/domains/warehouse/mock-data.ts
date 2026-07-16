/**
 * Warehouse + stock-out mock data. The inventory views use a DETERMINISTIC
 * Kỳ-indexed carry-forward: for each product×kho, seeded per-Kỳ (nhập, xuất)
 * deltas chain the opening stock across periods —
 *   tonDauKy(ky) = tonDauKy(prevKy) + nhập(prevKy) − xuất(prevKy)
 *   tonCuoiKy    = tonDauKy + nhập − xuất
 * so opening/closing are real (not two unrelated random numbers). Xuất is
 * capped by available stock, and the latest closing balance reconciles to the
 * same HANG_HOA_ROWS.tonKho value used by stock-out editors.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { mockDelay } from '@/lib/mock-delay'
import { HANG_HOA_ROWS, NGAN_CHUA_ROWS, NHA_KHO_ROWS } from '@/mock/masterdata'
import { BRANCHES } from '@/mock/seed/branches'
import { KY } from '@/mock/seed/ky'
import { MANUFACTURERS, MODELS } from '@/domains/repair/reference-data'
import type {
  InventoryRow,
  InventoryResult,
  InventoryKind,
  WarehouseListResult,
} from './types'

const NHOM_HANG = [
  'Điện lạnh',
  'Điện tử',
  'Điện Thoại',
  'Điện gia dụng',
  'linh kiện điện tử',
  'Dụng cụ sửa chửa',
  'Nguyên vật liêu sửa chửa',
  'Nhà vệ sinh',
]

const KY_ASC = KY.slice(-12) // last 12 periods, oldest→newest
const KY_INDEX = new Map(KY_ASC.map((k, i) => [k.id, i]))

interface ProductWarehouse {
  hangHoaId: string
  maHang: string
  tenHang: string
  giaVon: number
  nhomHang: string
  nhaSanXuat: string
  model: string
  khoId: string
  khoTen: string
  nganChuaId: string
  nganChua: string
  coSerial: boolean
  branchId: string
  currentAvailability: number
}

const PRODUCTS: ProductWarehouse[] = HANG_HOA_ROWS.slice(0, 30).map((hh, i) => {
  const rng = new SeededRandom(6100 + i)
  const kho = NHA_KHO_ROWS[i % NHA_KHO_ROWS.length]
  const nganChuaRows = NGAN_CHUA_ROWS.filter((row) => row.nhaKhoId === kho.id)
  const nganChua = nganChuaRows[i % nganChuaRows.length]
  return {
    hangHoaId: hh.id,
    maHang: hh.maHH,
    tenHang: hh.tenHH,
    giaVon: hh.giaNhap ?? 100_000,
    nhomHang: NHOM_HANG[i % NHOM_HANG.length],
    nhaSanXuat: MANUFACTURERS[i % MANUFACTURERS.length].ten,
    model: MODELS[i % MODELS.length].ten,
    khoId: kho.id,
    khoTen: kho.tenNhaKho,
    nganChuaId: nganChua.id,
    nganChua: nganChua.tenNgan,
    coSerial: rng.bool(0.5),
    branchId: BRANCHES[i % BRANCHES.length].id,
    currentAvailability: Math.max(0, hh.tonKho ?? 0),
  }
})

function periodFlow(
  productIdx: number,
  kyIdx: number,
  opening: number,
): { nhap: number; xuat: number } {
  const currentAvailability = PRODUCTS[productIdx]?.currentAvailability ?? 0
  if (kyIdx === KY_ASC.length - 1) {
    return opening <= currentAvailability
      ? { nhap: currentAvailability - opening, xuat: 0 }
      : { nhap: 0, xuat: opening - currentAvailability }
  }

  const rng = new SeededRandom(6200 + productIdx * 100 + kyIdx)
  const nhap = rng.int(0, 60)
  const xuat = rng.int(0, Math.min(70, opening + nhap))
  return { nhap, xuat }
}

/** Opening stock for a product at a given Kỳ index — chained carry-forward. */
function tonDauKy(productIdx: number, kyIdx: number): number {
  let ton = PRODUCTS[productIdx]?.currentAvailability ?? 0
  for (let k = 0; k < kyIdx; k++) {
    const { nhap, xuat } = periodFlow(productIdx, k, ton)
    ton = ton + nhap - xuat
  }
  return ton
}

/** Per-(product, ky) seeded nhập/xuất deltas. Deterministic by index. */
function deltaFor(
  productIdx: number,
  kyIdx: number,
): { nhap: number; xuat: number } {
  return periodFlow(productIdx, kyIdx, tonDauKy(productIdx, kyIdx))
}

/** Build one inventory row for a product at the selected Kỳ. */
function buildRow(
  p: ProductWarehouse,
  productIdx: number,
  kyIdx: number,
  kind: InventoryKind,
): InventoryRow {
  const ky = KY_ASC[kyIdx]
  const dauKy = tonDauKy(productIdx, kyIdx)
  const { nhap, xuat } = deltaFor(productIdx, kyIdx)
  const cuoiKy = dauKy + nhap - xuat
  const ton = cuoiKy
  return {
    id: `${kind}-${p.hangHoaId}-${ky.id}`,
    branchId: p.branchId,
    maHang: p.maHang,
    tenHang: p.tenHang,
    nhomHang: p.nhomHang,
    model: p.model,
    nhaSanXuat: p.nhaSanXuat,
    khoId: p.khoId,
    khoTen: p.khoTen,
    nganChuaId: p.nganChuaId,
    nganChua: p.nganChua,
    kyId: ky.id,
    kyLabel: ky.ten,
    coSerial: p.coSerial,
    giaVonDauKy: p.giaVon,
    tonDauKy: dauKy,
    nhapTrongKy: nhap,
    xuatTrongKy: xuat,
    ton,
    giaVonTrongKy: p.giaVon,
    tonCuoiKy: cuoiKy,
    tongTien: cuoiKy * p.giaVon,
    kyThuat:
      kind === 'ton-kho-ky-thuat'
        ? `KTV ${String.fromCharCode(65 + (productIdx % 6))}`
        : undefined,
  }
}

export interface InventoryParams {
  kind: InventoryKind
  kyId?: string
  branchId?: string
  khoId?: string
  nganChuaId?: string
  nhomHang?: string
  maHang?: string
  nhaSanXuat?: string
  model?: string
  kyThuat?: string
  page?: number
  pageSize?: number
}

/** Fetch inventory rows + KPI trio for a view, both from the SAME carry-forward. */
export async function fetchInventory(
  params: InventoryParams,
): Promise<InventoryResult> {
  await mockDelay(300, 150)

  const kyId = params.kyId ?? KY_ASC[KY_ASC.length - 1].id
  const kyIdx = KY_INDEX.get(kyId) ?? KY_ASC.length - 1

  let rows = PRODUCTS.map((p, i) => buildRow(p, i, kyIdx, params.kind))

  // The LK-xác view relates only to carcass warehouses; the technician view is
  // keyed by technician. Filter/scope accordingly, then apply user filters.
  if (params.branchId) rows = rows.filter((r) => r.branchId === params.branchId)
  if (params.khoId) rows = rows.filter((r) => r.khoId === params.khoId)
  if (params.nganChuaId)
    rows = rows.filter((r) => r.nganChuaId === params.nganChuaId)
  if (params.nhomHang) rows = rows.filter((r) => r.nhomHang === params.nhomHang)
  if (params.nhaSanXuat)
    rows = rows.filter((r) => r.nhaSanXuat === params.nhaSanXuat)
  if (params.model) rows = rows.filter((r) => r.model === params.model)
  if (params.maHang) {
    const q = params.maHang.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.maHang.toLowerCase().includes(q) ||
        r.tenHang.toLowerCase().includes(q),
    )
  }
  if (params.kyThuat) {
    const q = params.kyThuat.toLowerCase()
    rows = rows.filter((r) => r.kyThuat?.toLowerCase().includes(q))
  }

  // KPI trio sums the SAME nonnegative rows (no parallel random source).
  const kpi = {
    tonDauKy: rows.reduce((s, r) => s + r.tonDauKy, 0),
    tongTien: rows.reduce((s, r) => s + r.tongTien, 0),
    tongTon: rows.reduce((s, r) => s + r.tonCuoiKy, 0),
  }

  const total = rows.length
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const start = (page - 1) * pageSize
  return { rows: rows.slice(start, start + pageSize), total, kpi }
}

/** Expose the carry-forward for tests (opening chain + closing invariant). */
export const inventoryMath = {
  kyAsc: KY_ASC,
  tonDauKy,
  deltaFor,
  productCount: PRODUCTS.length,
}

// ── Generic paginate helper for the warehouse/stock-out lists ──────────────

export function paginate<T>(
  rows: T[],
  page = 1,
  pageSize = 20,
): WarehouseListResult<T> {
  const start = (page - 1) * pageSize
  return { data: rows.slice(start, start + pageSize), total: rows.length }
}

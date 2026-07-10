/**
 * Mock data generators for the local-extra reports kept per V5 — Xuất Kho and
 * Doanh Thu (Phase 7 — owned exclusively). The 4 reference-superseded reports
 * (sua-chua/ky-thuat/tiep-nhan/bao-hanh) were retired from this file: ky-thuat
 * and bao-hanh became bespoke chart/cost pages (KyThuatReportPage,
 * BaoHanhReportPage), and sua-chua/tiep-nhan report ids have no route.
 * All randomness via SeededRandom (deterministic). 5% error rate, 400–900ms latency.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow } from '@/lib/mock-error'
import { BRANCHES } from '@/mock/seed/branches'
import type { ReportRow, ReportResult } from './report-types'

// ── Shared Vietnamese reference data ─────────────────────────────────────────

const TECHNICIANS = [
  'Nguyễn Văn An',
  'Trần Thị Bình',
  'Lê Hoàng Cường',
  'Phạm Minh Đức',
  'Võ Thị Hoa',
  'Đặng Quốc Hùng',
  'Bùi Thị Lan',
  'Hoàng Văn Nam',
]

const DEVICE_MODELS = [
  'iPhone 14 Pro Max',
  'Samsung Galaxy S23',
  'Xiaomi 13T',
  'OPPO Reno 10',
  'Vivo Y36',
  'Realme 11 Pro',
  'iPhone 13',
  'Samsung A54',
]

const PRODUCT_GROUPS = [
  'Màn hình',
  'Pin',
  'Camera',
  'Bo mạch',
  'Loa/Mic',
  'Sạc/Cáp',
  'Vỏ máy',
]

// ── Date helper ────────────────────────────────────────────────────────────────

/** Generate a random ISO date string within a given range. */
function randomDateInRange(
  rng: SeededRandom,
  fromIso?: string,
  toIso?: string,
): string {
  const from = fromIso
    ? new Date(fromIso).getTime()
    : Date.now() - 30 * 86_400_000
  const to = toIso ? new Date(toIso).getTime() : Date.now()
  const ts = from + rng.float() * (to - from)
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// ── Per-report row builders ───────────────────────────────────────────────────

function buildXuatKhoRow(
  rng: SeededRandom,
  i: number,
  params: FilterParams,
): ReportRow {
  const soLuong = rng.int(1, 10)
  const donGia = rng.int(50_000, 800_000)
  return {
    soPhieuXuat: `XK${String(3000 + i).padStart(5, '0')}`,
    ngayXuat: randomDateInRange(rng, params.tuNgay, params.denNgay),
    nhomHangHoa: rng.pick(PRODUCT_GROUPS),
    tenHangHoa: `${rng.pick(PRODUCT_GROUPS)} ${rng.pick(DEVICE_MODELS).split(' ')[0]}`,
    soLuong,
    donGia,
    thanhTien: soLuong * donGia,
    kyThuatNhanHang: rng.pick(TECHNICIANS),
    chiNhanh: rng.pick(BRANCHES).name,
    lyDoXuat: rng.pick(['Sửa chữa', 'Bán hàng', 'Điều chuyển', 'Hỏng']),
  }
}

function buildDoanhThuRow(
  rng: SeededRandom,
  i: number,
  params: FilterParams,
): ReportRow {
  const doanhThuSua = rng.int(500_000, 5_000_000)
  const doanhThuBanHang = rng.int(0, 3_000_000)
  const chiPhi = rng.int(200_000, 2_000_000)
  return {
    ngay: randomDateInRange(rng, params.tuNgay, params.denNgay),
    chiNhanh: rng.pick(BRANCHES).name,
    doanhThuSuaChua: doanhThuSua,
    doanhThuBanHang,
    tongDoanhThu: doanhThuSua + doanhThuBanHang,
    tongChiPhi: chiPhi,
    loiNhuan: doanhThuSua + doanhThuBanHang - chiPhi,
    soPhieuSuaChua: rng.int(5, 25),
    soPhieuBanHang: rng.int(0, 10),
  }
}

// ── Shared filter interface (generic date range params) ────────────────────────

interface FilterParams {
  tuNgay?: string
  denNgay?: string
  [key: string]: unknown
}

type RowBuilder = (
  rng: SeededRandom,
  i: number,
  params: FilterParams,
) => ReportRow

const ROW_BUILDERS: Record<string, RowBuilder> = {
  'xuat-kho': buildXuatKhoRow,
  'doanh-thu': buildDoanhThuRow,
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate mock report rows for the local-extra reports (xuat-kho, doanh-thu).
 * Row count: 8–30. Seed derived from reportId + params for determinism.
 */
export async function fetchReportRows(
  reportId: string,
  params: FilterParams,
): Promise<ReportResult<ReportRow>> {
  await mockDelay(400, 500)
  maybeThrow(0.05)

  const builder = ROW_BUILDERS[reportId]
  if (!builder) {
    return { rows: [], totalCount: 0, generatedAt: new Date().toISOString() }
  }

  const seedStr = `${reportId}${params.tuNgay ?? ''}${params.denNgay ?? ''}`
  const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 17)
  const rng = new SeededRandom(seed)
  const count = rng.int(8, 30)

  const rows: ReportRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push(builder(rng, i, params))
  }

  return {
    rows,
    totalCount: rows.length,
    generatedAt: new Date().toISOString(),
  }
}

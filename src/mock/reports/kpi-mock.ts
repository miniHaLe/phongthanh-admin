/**
 * KPI report shared reference data + mock data generators (Phase 7 — owned
 * exclusively). Backs both KPI KTV (R4) and KPI Tiếp nhận (R5) — same shape,
 * different person pool (technician vs receptionist).
 * All randomness via SeededRandom (deterministic). 5% simulated error rate.
 * Latency: 400–900ms via mockDelay.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow } from '@/lib/mock-error'
import { BRANCHES } from '@/mock/seed/branches'
import { TECHNICIANS } from '@/domains/repair/reference-data'
import type { KpiFilterParams, KpiRow, ReportResult } from './report-types'

// ── Person pools (multi-select options) ──────────────────────────────────────

export interface KpiPersonOption {
  id: string
  label: string
}

/** Full technician pool for KPI KTV — reuses the canonical repair-domain list. */
export const KPI_TECHNICIAN_OPTIONS: KpiPersonOption[] = TECHNICIANS.map(
  (t) => ({ id: t.id, label: t.ten }),
)

const RECEPTIONIST_NAMES = [
  'Nguyễn Thị Thu Hà',
  'Trần Văn Phúc',
  'Lê Thị Kim Ngân',
  'Phạm Thanh Tùng',
  'Võ Thị Bích Trâm',
  'Đặng Văn Sơn',
  'Bùi Thị Ánh Tuyết',
  'Hoàng Minh Quân',
]

/** Full receptionist pool for KPI Tiếp nhận. */
export const KPI_RECEPTIONIST_OPTIONS: KpiPersonOption[] =
  RECEPTIONIST_NAMES.map((ten, i) => ({ id: `tt-${String(i + 1).padStart(2, '0')}`, label: ten }))

// ── Nhóm sản phẩm (13 named groups, exact reference labels) ─────────────────

const NHOM_SAN_PHAM_KPI_NAMES = [
  'MÁY LỌC NƯƠC RO-CÂY NÓNG LẠNH',
  'TI VI LCD',
  'ĐIỆN THOẠI',
  'ĐỒ GIA DỤNG',
  'LINH KIỆN ĐIỆN TỬ',
  'NGUYÊN VẬT LIỆU SỬA CHỬA',
  'DỤNG CỤ SỬA CHỬA',
  'MÁY LẠNH -ĐIỀU HÒA',
  'MÁY GIẶT -MÁY RỬA CHÉN -MÁY SẤY',
  'TỦ LẠNH-TỦ MÁT - TỦ ĐÔNG',
  'THIẾT BỊ ĐIỆN TỬ',
  'Thiết bị vệ sinh',
  'thiết bị thể dục thể thao',
]

export const KPI_NHOM_SAN_PHAM_OPTIONS: KpiPersonOption[] =
  NHOM_SAN_PHAM_KPI_NAMES.map((ten, i) => ({ id: `nspk-${i + 1}`, label: ten }))

// ── Period label builder ─────────────────────────────────────────────────────

/** Build period label depending on filter mode. */
function buildPeriodLabels(params: KpiFilterParams): string[] {
  if (params.mode === 'ngay') {
    const from = new Date(params.tuNgay ?? new Date())
    const to = new Date(params.denNgay ?? new Date())
    const days: string[] = []
    const cur = new Date(from)
    while (cur <= to && days.length < 31) {
      days.push(
        `${String(cur.getDate()).padStart(2, '0')}/${String(cur.getMonth() + 1).padStart(2, '0')}/${cur.getFullYear()}`,
      )
      cur.setDate(cur.getDate() + 1)
    }
    return days.length > 0 ? days : ['01/01/2025']
  }

  if (params.mode === 'thang') {
    const year = params.nam ?? new Date().getFullYear()
    const fromM = params.tuThang ?? 1
    const toM = params.denThang ?? 12
    const months: string[] = []
    for (let m = fromM; m <= toM; m++) {
      months.push(`Tháng ${m}/${year}`)
    }
    return months.length > 0 ? months : [`Tháng 1/${year}`]
  }

  // nam
  const fromY = params.tuNam ?? new Date().getFullYear() - 1
  const toY = params.denNam ?? new Date().getFullYear()
  const years: string[] = []
  for (let y = fromY; y <= toY; y++) {
    years.push(`Năm ${y}`)
  }
  return years.length > 0 ? years : [`Năm ${new Date().getFullYear()}`]
}

/**
 * Generate 5–20 KPI rows bucketed by selected period.
 * Seed is derived from params to keep results stable for the same filter.
 * `personPool` is the full option list for the calling report (technician or
 * receptionist) — `personIds` (empty = "Tất cả") narrows it.
 */
function generateKpiRows(
  params: KpiFilterParams,
  personPool: KpiPersonOption[],
): KpiRow[] {
  const seed =
    (params.tuNgay ?? params.tuNam ?? params.nam ?? 42)
      .toString()
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0) + params.mode.length

  const rng = new SeededRandom(seed)
  const periods = buildPeriodLabels(params)

  const selectedPersons =
    params.personIds && params.personIds.length > 0
      ? personPool.filter((p) => params.personIds!.includes(p.id))
      : personPool

  const activePersons = selectedPersons.length > 0 ? selectedPersons : personPool

  // Filter branches
  const branchNames =
    params.chiNhanh === 'all'
      ? BRANCHES.map((b) => b.name)
      : BRANCHES.filter((b) => b.id === params.chiNhanh).map((b) => b.name)

  const activeBranches =
    branchNames.length > 0 ? branchNames : BRANCHES.map((b) => b.name)

  const rowCount = rng.int(
    5,
    Math.min(20, activePersons.length * periods.length),
  )
  const rows: KpiRow[] = []

  for (let i = 0; i < rowCount; i++) {
    const person = rng.pick(activePersons)
    const branch = rng.pick(activeBranches)
    const period = rng.pick(periods)
    const hoanThanh = rng.int(2, 25)
    const dangSua = rng.int(0, 8)
    const quaHan = rng.int(0, 3)
    const tongPhieu = hoanThanh + dangSua + quaHan + rng.int(0, 2)
    const chiPhi = rng.int(150_000, 2_500_000) * tongPhieu

    rows.push({
      id: `kpi-${i}-${seed}`,
      kyThuat: person.label,
      chiNhanh: branch,
      tongPhieu,
      hoanThanh,
      dangSua,
      quaHan,
      chiPhi,
      period,
    })
  }

  // Sort by tongPhieu desc (default)
  return rows.sort((a, b) => b.tongPhieu - a.tongPhieu)
}

/** Async wrapper with latency + 5% error injection — KPI Kỹ thuật (R4). */
export async function fetchKpiReport(
  params: KpiFilterParams,
): Promise<ReportResult<KpiRow>> {
  await mockDelay(400, 500)
  maybeThrow(0.05)

  const rows = generateKpiRows(params, KPI_TECHNICIAN_OPTIONS)
  return {
    rows,
    totalCount: rows.length,
    generatedAt: new Date().toISOString(),
  }
}

/** Async wrapper with latency + 5% error injection — KPI Tiếp nhận (R5). */
export async function fetchKpiTiepNhanReport(
  params: KpiFilterParams,
): Promise<ReportResult<KpiRow>> {
  await mockDelay(400, 500)
  maybeThrow(0.05)

  const rows = generateKpiRows(params, KPI_RECEPTIONIST_OPTIONS)
  return {
    rows,
    totalCount: rows.length,
    generatedAt: new Date().toISOString(),
  }
}

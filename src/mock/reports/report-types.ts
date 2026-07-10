/**
 * Type definitions for all report schemas (Phase 7 — owned exclusively).
 * Imported by kpi-mock, sua-chua-report-mock, report-configs, and all report pages.
 */
import type { ZodSchema } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'

// ── Period mode ──────────────────────────────────────────────────────────────
export type PeriodMode = 'ngay' | 'thang' | 'nam'

// ── KPI filter params ────────────────────────────────────────────────────────
export interface KpiFilterParams {
  mode: PeriodMode
  chiNhanh: string // 'all' | BranchId
  /** Multi-select person ids — technician ids for KPI KTV, receptionist ids
   * for KPI Tiếp nhận. Empty/omitted = "Tất cả" (every person in the pool). */
  personIds?: string[]
  /** Multi-select product-group ids. Empty/omitted = "Tất cả nhóm". */
  nhomSanPhamIds?: string[]
  // mode = 'ngay'
  tuNgay?: string // ISO date string
  denNgay?: string
  // mode = 'thang'
  nam?: number
  tuThang?: number
  denThang?: number
  // mode = 'nam'
  tuNam?: number
  denNam?: number
}

// ── KPI row ──────────────────────────────────────────────────────────────────
export interface KpiRow {
  id: string
  kyThuat: string // technician name
  chiNhanh: string
  tongPhieu: number // total tickets
  hoanThanh: number
  dangSua: number
  quaHan: number
  chiPhi: number // VND
  period: string // label for the time bucket (e.g. "01/06/2025")
}

// ── Generic report row ────────────────────────────────────────────────────────
export type ReportRow = Record<string, string | number | null>

// ── Report result ─────────────────────────────────────────────────────────────
export interface ReportResult<T = ReportRow> {
  rows: T[]
  totalCount: number
  generatedAt: string // ISO datetime
}

// ── Export item / group ───────────────────────────────────────────────────────
export interface ExportItem {
  label: string
  /** When true, item is shown as disabled with a tooltip */
  disabledWhen?: boolean
  disabledTooltip?: string
  onExport: () => void
}

export interface ExportGroup {
  label: string
  items: ExportItem[]
}

// ── Report config (drives the generic ReportPage) ────────────────────────────
export interface ReportConfig {
  id: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterSchema: ZodSchema<any>
  defaultValues: Record<string, unknown>
  columns: ColumnDef<ReportRow>[]
  queryFn: (params: unknown) => Promise<ReportResult>
  exportGroups: ExportGroup[]
  /** Optional: whether to reserve a chart slot above the table */
  chartSlot?: boolean
}

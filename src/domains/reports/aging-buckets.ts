import {
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_LABEL,
  type RepairStatusId,
} from '@/domains/repair/status'
import type { RepairTicket } from '@/domains/repair/types'

const DAY_MS = 86_400_000

export type KpiPersonDimension = 'technician' | 'receiver'
export type KpiBucketKey =
  'day1' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6' | 'day7' | 'over7'

export interface KpiAgingRow {
  personId: string
  personName: string
  day1: number
  day2: number
  day3: number
  day4: number
  day5: number
  day6: number
  day7: number
  over7: number
  total: number
}

export interface KpiAgingOptions {
  personKey: KpiPersonDimension
  from: string | Date
  to: string | Date
  branchId?: string
  personIds?: readonly string[]
  productGroupIds?: readonly string[]
}

export type MayTonBucketKey =
  'day1' | 'day3' | 'day7' | 'day14' | 'day21' | 'day30' | 'day31Plus'

export type MayTonCellKey = 'total' | MayTonBucketKey

export interface MayTonAgingRow {
  statusId: RepairStatusId
  statusLabel: string
  total: number
  day1: number
  day3: number
  day7: number
  day14: number
  day21: number
  day30: number
  day31Plus: number
}

export interface MayTonAgingOptions {
  branchId?: string
  from?: string | Date
  to?: string | Date
}

export interface MayTonDrilldownOptions extends MayTonAgingOptions {
  statusId: RepairStatusId
  bucket: MayTonCellKey
}

export interface ReportPeriodSelection {
  mode: 'ngay' | 'thang' | 'nam'
  tuNgay?: string
  denNgay?: string
  nam?: number
  tuThang?: number
  denThang?: number
  tuNam?: number
  denNam?: number
}

function calendarDayIndex(value: string | Date): number {
  if (typeof value === 'string') {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (dateOnly) {
      return (
        Date.UTC(
          Number(dateOnly[1]),
          Number(dateOnly[2]) - 1,
          Number(dateOnly[3]),
        ) / DAY_MS
      )
    }
  }

  const date = value instanceof Date ? value : new Date(value)
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS
}

function isWithinCalendarRange(
  value: string,
  from?: string | Date,
  to?: string | Date,
): boolean {
  const day = calendarDayIndex(value)
  return (
    (from === undefined || day >= calendarDayIndex(from)) &&
    (to === undefined || day <= calendarDayIndex(to))
  )
}

function calendarAgeDays(from: string, to: string | Date): number {
  return Math.max(0, calendarDayIndex(to) - calendarDayIndex(from))
}

function classifyKpiAge(ageDays: number): KpiBucketKey {
  const normalized = Math.max(1, Math.floor(ageDays))
  if (normalized <= 7) return `day${normalized}` as KpiBucketKey
  return 'over7'
}

function seededProductGroupId(ticket: RepairTicket): string | undefined {
  const name = ticket.tenSanPham.toLocaleLowerCase('vi')
  if (name.includes('tivi')) return 'nspk-2'
  if (name.includes('máy lạnh')) return 'nspk-8'
  if (name.includes('máy giặt')) return 'nspk-9'
  if (name.includes('tủ lạnh')) return 'nspk-10'
  return undefined
}

function emptyKpiRow(personId: string, personName: string): KpiAgingRow {
  return {
    personId,
    personName,
    day1: 0,
    day2: 0,
    day3: 0,
    day4: 0,
    day5: 0,
    day6: 0,
    day7: 0,
    over7: 0,
    total: 0,
  }
}

export function computeKpiAging(
  tickets: readonly RepairTicket[],
  options: KpiAgingOptions,
): KpiAgingRow[] {
  const personFilter = new Set(options.personIds ?? [])
  const productGroupFilter = new Set(options.productGroupIds ?? [])
  const rows = new Map<string, KpiAgingRow>()

  for (const ticket of tickets) {
    if (!ticket.ngayHoanThanh) continue
    if (options.branchId && ticket.branchId !== options.branchId) continue
    if (!isWithinCalendarRange(ticket.ngayHoanThanh, options.from, options.to))
      continue
    if (
      productGroupFilter.size > 0 &&
      !productGroupFilter.has(seededProductGroupId(ticket) ?? '')
    )
      continue

    const personId =
      options.personKey === 'technician' ? ticket.kyThuatId : ticket.nguoiNhan
    const personName =
      options.personKey === 'technician' ? ticket.kyThuat : ticket.nguoiNhan
    if (personFilter.size > 0 && !personFilter.has(personId)) continue

    const row = rows.get(personId) ?? emptyKpiRow(personId, personName)
    const bucket = classifyKpiAge(
      calendarAgeDays(ticket.ngayNhan, ticket.ngayHoanThanh),
    )
    row[bucket] += 1
    row.total += 1
    rows.set(personId, row)
  }

  return [...rows.values()].sort(
    (left, right) =>
      left.personName.localeCompare(right.personName, 'vi') ||
      left.personId.localeCompare(right.personId),
  )
}

/**
 * Candidate only: live Chrome verification is still required before backend
 * SQL treats these May Ton boundaries as confirmed legacy behavior.
 */
export function classifyMayTonAgeUsingUnverifiedCandidateRanges(
  ageDays: number,
): MayTonBucketKey {
  const age = Math.max(0, Math.floor(ageDays))
  if (age <= 1) return 'day1'
  if (age <= 3) return 'day3'
  if (age <= 7) return 'day7'
  if (age <= 14) return 'day14'
  if (age <= 21) return 'day21'
  if (age <= 30) return 'day30'
  return 'day31Plus'
}

function currentStatusChangedAt(ticket: RepairTicket): string {
  let changedAt: string | undefined
  for (let index = ticket.statusHistory.length - 1; index >= 0; index -= 1) {
    const entry = ticket.statusHistory[index]
    if (entry.status !== ticket.tinhTrang) break
    changedAt = entry.changedAt
  }
  return changedAt ?? ticket.updatedAt
}

function matchesMayTonScope(
  ticket: RepairTicket,
  options: MayTonAgingOptions,
  includePeriod: boolean,
): boolean {
  if (options.branchId && ticket.branchId !== options.branchId) return false
  // Preserve the prior mock's receive-date filter until legacy period semantics are verified.
  if (
    includePeriod &&
    !isWithinCalendarRange(ticket.ngayNhan, options.from, options.to)
  )
    return false
  return true
}

function emptyMayTonRow(statusId: RepairStatusId): MayTonAgingRow {
  return {
    statusId,
    statusLabel: STATUS_LABEL[statusId],
    total: 0,
    day1: 0,
    day3: 0,
    day7: 0,
    day14: 0,
    day21: 0,
    day30: 0,
    day31Plus: 0,
  }
}

export function computeMayTonAging(
  tickets: readonly RepairTicket[],
  today: string | Date,
  options: MayTonAgingOptions = {},
): MayTonAgingRow[] {
  const rows = new Map(
    REPAIR_STATUS_DISPLAY_ORDER.map((statusId) => [
      statusId,
      emptyMayTonRow(statusId),
    ]),
  )

  for (const ticket of tickets) {
    if (!matchesMayTonScope(ticket, options, false)) continue
    rows.get(ticket.tinhTrang)!.total += 1
    if (!matchesMayTonScope(ticket, options, true)) continue

    const bucket = classifyMayTonAgeUsingUnverifiedCandidateRanges(
      calendarAgeDays(currentStatusChangedAt(ticket), today),
    )
    rows.get(ticket.tinhTrang)![bucket] += 1
  }

  return REPAIR_STATUS_DISPLAY_ORDER.map((statusId) => rows.get(statusId)!)
}

export function selectMayTonDrilldownTickets(
  tickets: readonly RepairTicket[],
  today: string | Date,
  options: MayTonDrilldownOptions,
): RepairTicket[] {
  return tickets
    .filter((ticket) => {
      if (ticket.tinhTrang !== options.statusId) return false
      if (!matchesMayTonScope(ticket, options, options.bucket !== 'total'))
        return false
      if (options.bucket === 'total') return true
      return (
        classifyMayTonAgeUsingUnverifiedCandidateRanges(
          calendarAgeDays(currentStatusChangedAt(ticket), today),
        ) === options.bucket
      )
    })
    .sort((left, right) => left.soPhieu.localeCompare(right.soPhieu))
}

export function resolveReportPeriodBounds(
  selection: ReportPeriodSelection,
  referenceDate: string | Date,
): { from: string; to: string } {
  const reference =
    referenceDate instanceof Date ? referenceDate : new Date(referenceDate)
  const fallbackYear = reference.getFullYear()

  if (selection.mode === 'thang') {
    const year = selection.nam ?? fallbackYear
    const fromMonth = selection.tuThang ?? 1
    const toMonth = selection.denThang ?? 12
    return {
      from: `${year}-${String(fromMonth).padStart(2, '0')}-01`,
      to: new Date(Date.UTC(year, toMonth, 0)).toISOString().slice(0, 10),
    }
  }

  if (selection.mode === 'nam') {
    const fromYear = selection.tuNam ?? fallbackYear - 1
    const toYear = selection.denNam ?? fallbackYear
    return { from: `${fromYear}-01-01`, to: `${toYear}-12-31` }
  }

  return {
    from: selection.tuNgay ?? reference.toISOString().slice(0, 10),
    to: selection.denNgay ?? reference.toISOString().slice(0, 10),
  }
}

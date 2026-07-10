/**
 * URL-synced filter state for the repair list page.
 * All filter fields are serialized to/from URLSearchParams via React Router v6.
 * Status is a single legacy id (Index_8 single-select).
 */
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import { parseStatusId } from '@/domains/repair/status'
import type {
  RepairListFilters,
  HinhThuc,
  LoaiBaoHanh,
  DateType,
} from '@/domains/repair/types'
import { subDays, format } from 'date-fns'

// ── Default filter factory ────────────────────────────────────────────────

function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

function thirtyDaysAgoIso(): string {
  return format(subDays(new Date(), 30), 'yyyy-MM-dd')
}

export function buildDefaultFilters(activeBranch: string): RepairListFilters {
  const branchId = activeBranch === 'all' ? 'dak-lak' : activeBranch
  return {
    branchId,
    // No status filter by default — the legend shows all statuses' counts.
    tinhTrang: undefined,
    dateType: 'nhan',
    dateFrom: thirtyDaysAgoIso(),
    dateTo: todayIso(),
  }
}

// ── URL serialization helpers ─────────────────────────────────────────────

function toParams(filters: RepairListFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.branchId) p.set('branchId', filters.branchId)
  if (filters.tinhTrang != null) p.set('tinhTrang', String(filters.tinhTrang))
  if (filters.hinhThuc?.length) p.set('hinhThuc', filters.hinhThuc.join(','))
  if (filters.nhaSanXuatId) p.set('nhaSanXuatId', filters.nhaSanXuatId)
  if (filters.sanPhamId) p.set('sanPhamId', filters.sanPhamId)
  if (filters.modelId) p.set('modelId', filters.modelId)
  if (filters.soPhieu) p.set('soPhieu', filters.soPhieu)
  if (filters.soPhieuHang) p.set('soPhieuHang', filters.soPhieuHang)
  if (filters.soSerial) p.set('soSerial', filters.soSerial)
  if (filters.tenKhachHang) p.set('tenKhachHang', filters.tenKhachHang)
  if (filters.khachHangId) p.set('khachHangId', filters.khachHangId)
  if (filters.sdt) p.set('sdt', filters.sdt)
  if (filters.kyThuatId) p.set('kyThuatId', filters.kyThuatId)
  if (filters.kyId) p.set('kyId', filters.kyId)
  if (filters.tinh) p.set('tinh', filters.tinh)
  if (filters.huyen) p.set('huyen', filters.huyen)
  if (filters.tuyen) p.set('tuyen', filters.tuyen)
  if (filters.daiLy) p.set('daiLy', filters.daiLy)
  if (filters.diaChi) p.set('diaChi', filters.diaChi)
  if (filters.loaiBaoHanh) p.set('loaiBaoHanh', filters.loaiBaoHanh)
  if (filters.suaGap) p.set('suaGap', '1')
  if (filters.dateType) p.set('dateType', filters.dateType)
  if (filters.dateFrom) p.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) p.set('dateTo', filters.dateTo)
  return p
}

function fromParams(
  sp: URLSearchParams,
  defaults: RepairListFilters,
): RepairListFilters {
  if (sp.size === 0) return defaults

  // Single-status parse: tolerate a stale comma list (take the first valid id).
  const rawStatus = sp.get('tinhTrang')
  const statusId = rawStatus
    ? parseStatusId(rawStatus.split(',')[0]?.trim())
    : undefined

  return {
    branchId: sp.get('branchId') ?? defaults.branchId,
    tinhTrang: statusId ?? undefined,
    hinhThuc: sp.has('hinhThuc')
      ? (sp.get('hinhThuc')!.split(',').filter(Boolean) as HinhThuc[])
      : defaults.hinhThuc,
    nhaSanXuatId: sp.get('nhaSanXuatId') ?? defaults.nhaSanXuatId,
    sanPhamId: sp.get('sanPhamId') ?? defaults.sanPhamId,
    modelId: sp.get('modelId') ?? defaults.modelId,
    soPhieu: sp.get('soPhieu') ?? defaults.soPhieu,
    soPhieuHang: sp.get('soPhieuHang') ?? defaults.soPhieuHang,
    soSerial: sp.get('soSerial') ?? defaults.soSerial,
    tenKhachHang: sp.get('tenKhachHang') ?? defaults.tenKhachHang,
    khachHangId: sp.get('khachHangId') ?? defaults.khachHangId,
    sdt: sp.get('sdt') ?? defaults.sdt,
    kyThuatId: sp.get('kyThuatId') ?? defaults.kyThuatId,
    kyId: sp.get('kyId') ?? defaults.kyId,
    tinh: sp.get('tinh') ?? defaults.tinh,
    huyen: sp.get('huyen') ?? defaults.huyen,
    tuyen: sp.get('tuyen') ?? defaults.tuyen,
    daiLy: sp.get('daiLy') ?? defaults.daiLy,
    diaChi: sp.get('diaChi') ?? defaults.diaChi,
    loaiBaoHanh: (sp.get('loaiBaoHanh') as LoaiBaoHanh | null) ?? defaults.loaiBaoHanh,
    suaGap: sp.get('suaGap') === '1' ? true : defaults.suaGap,
    dateType: (sp.get('dateType') as DateType | null) ?? defaults.dateType,
    dateFrom: sp.get('dateFrom') ?? defaults.dateFrom,
    dateTo: sp.get('dateTo') ?? defaults.dateTo,
  }
}

// ── Count active non-default filters ─────────────────────────────────────

function countActiveFilters(
  filters: RepairListFilters,
  defaults: RepairListFilters,
): number {
  let count = 0
  const keys: (keyof RepairListFilters)[] = [
    'branchId',
    'tinhTrang',
    'nhaSanXuatId',
    'sanPhamId',
    'modelId',
    'soPhieu',
    'soPhieuHang',
    'soSerial',
    'tenKhachHang',
    'khachHangId',
    'sdt',
    'kyThuatId',
    'kyId',
    'tinh',
    'huyen',
    'tuyen',
    'daiLy',
    'diaChi',
    'loaiBaoHanh',
    'suaGap',
    'dateType',
    'dateFrom',
    'dateTo',
  ]
  for (const k of keys) {
    if (filters[k] !== defaults[k]) count++
  }
  const defHinhThuc = (defaults.hinhThuc ?? []).join(',')
  const curHinhThuc = (filters.hinhThuc ?? []).join(',')
  if (defHinhThuc !== curHinhThuc) count++
  return count
}

// ── Hook ─────────────────────────────────────────────────────────────────

export interface UseRepairFiltersReturn {
  filters: RepairListFilters
  defaults: RepairListFilters
  setFilters: (next: Partial<RepairListFilters>) => void
  clearFilters: () => void
  activeFilterCount: number
}

export function useRepairFilters(): UseRepairFiltersReturn {
  const activeBranch = useAppStore((s) => s.activeBranch)
  const [searchParams, setSearchParams] = useSearchParams()

  const defaults = useMemo(
    () => buildDefaultFilters(activeBranch),
    [activeBranch],
  )

  const filters = useMemo(() => {
    if (searchParams.size === 0) return defaults
    return fromParams(searchParams, defaults)
  }, [searchParams, defaults])

  const setFilters = useCallback(
    (next: Partial<RepairListFilters>) => {
      const merged: RepairListFilters = { ...filters, ...next }
      setSearchParams(toParams(merged), { replace: true })
    },
    [filters, setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(toParams(defaults), { replace: true })
  }, [defaults, setSearchParams])

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, defaults),
    [filters, defaults],
  )

  return { filters, defaults, setFilters, clearFilters, activeFilterCount }
}

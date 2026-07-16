import { isWithinInterval, parseISO } from 'date-fns'
import type { LoaiNgay } from '@/config/finance-tables/thu-chi.config'
import type { ThuChi } from '@/types/finance-types'

export interface ThuChiFilters {
  branchId?: string
  tinhTrang?: string
  hinhThucId?: string
  loaiThuChi?: string
  soChungTu?: string
  kyThuat?: string
  nhaSanXuat?: string
  soPhieuScNk?: string
  tenKhachHang?: string
  noiDung?: string
  nguoiTao?: string
  daiLy?: string
  loaiNgay: LoaiNgay
  dateFrom?: string
  dateTo?: string
}

function includesText(value: string | null, query: string): boolean {
  return value?.toLowerCase().includes(query.toLowerCase()) ?? false
}

export function filterThuChiRows(rows: ThuChi[], filters: ThuChiFilters) {
  let result = rows
  if (filters.branchId)
    result = result.filter((row) => row.branchId === filters.branchId)
  if (filters.tinhTrang)
    result = result.filter(
      (row) => String(row.tinhTrang) === filters.tinhTrang,
    )
  if (filters.hinhThucId)
    result = result.filter(
      (row) => String(row.hinhThucId) === filters.hinhThucId,
    )
  if (filters.loaiThuChi)
    result = result.filter(
      (row) => String(row.loaiThuChi) === filters.loaiThuChi,
    )
  if (filters.soChungTu) {
    const query = filters.soChungTu.toLowerCase()
    result = result.filter((row) =>
      row.soChungTu.toLowerCase().includes(query),
    )
  }
  if (filters.kyThuat)
    result = result.filter((row) => includesText(row.kyThuat, filters.kyThuat!))
  if (filters.nhaSanXuat)
    result = result.filter((row) =>
      includesText(row.nhaSanXuat, filters.nhaSanXuat!),
    )
  if (filters.soPhieuScNk)
    result = result.filter(
      (row) =>
        includesText(row.soPhieuScNk, filters.soPhieuScNk!) ||
        includesText(row.soPhieuHang, filters.soPhieuScNk!),
    )
  if (filters.tenKhachHang) {
    const query = filters.tenKhachHang.toLowerCase()
    result = result.filter((row) =>
      row.tenKhachHang.toLowerCase().includes(query),
    )
  }
  if (filters.noiDung) {
    const query = filters.noiDung.toLowerCase()
    result = result.filter((row) => row.noiDung.toLowerCase().includes(query))
  }
  if (filters.nguoiTao)
    result = result.filter((row) => includesText(row.nguoiTao, filters.nguoiTao!))
  if (filters.daiLy)
    result = result.filter((row) => includesText(row.daiLy, filters.daiLy!))
  if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom ? parseISO(filters.dateFrom) : new Date(0)
    const to = filters.dateTo
      ? parseISO(filters.dateTo)
      : new Date(8640000000000000)
    result = result.filter((row) => {
      const dateField =
        filters.loaiNgay === 'ngay_lap' ? row.ngayLap : row.ngayThuChi
      if (!dateField) return false
      try {
        return isWithinInterval(parseISO(dateField), { start: from, end: to })
      } catch {
        return false
      }
    })
  }
  return result
}

import type {
  ReceivingLine,
  ReceivingVoucher,
} from '@/domains/warehouse/types'
import type { ReceivingFilters } from './receiving-filters'

export interface ReceivingDetailRow extends ReceivingLine {
  id: string
  soPhieu: string
  ngayLap: string
  nhaCungCap: string
  khoTen: string
}

function matchesLine(line: ReceivingLine, filters: ReceivingFilters): boolean {
  if (filters.nganChuaId && line.nganChuaId !== filters.nganChuaId) return false
  if (filters.maSanPham) {
    const query = filters.maSanPham.toLowerCase()
    if (!`${line.ma} ${line.ten}`.toLowerCase().includes(query)) return false
  }
  return true
}

export function buildReceivingDetailRows(
  vouchers: ReceivingVoucher[],
  filters: ReceivingFilters,
): ReceivingDetailRow[] {
  return vouchers.flatMap((voucher) =>
    voucher.lines
      .filter((line) => matchesLine(line, filters))
      .map((line, index) => ({
        ...line,
        id: `${voucher.id}-${index}`,
        soPhieu: voucher.soPhieu,
        ngayLap: voucher.ngayLap,
        nhaCungCap: voucher.nhaCungCap,
        khoTen: voucher.khoTen,
      })),
  )
}

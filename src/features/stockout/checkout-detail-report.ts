import type { CheckOutLine, CheckOutSlip } from '@/domains/warehouse/types'
import type { CapLinhKienFilterValues } from './cap-linh-kien-filters'

export interface CheckoutDetailRow extends CheckOutLine {
  id: string
  soPhieuCap: string
  ngayLap: string
  kyThuat: string
}

function matchesLine(
  line: CheckOutLine,
  filters: CapLinhKienFilterValues,
): boolean {
  if (filters.khoId && line.khoId !== filters.khoId) return false
  if (filters.mucDich && line.mucDich !== filters.mucDich) return false
  if (
    filters.soPhieuSC &&
    !line.soPhieuSC.toLowerCase().includes(filters.soPhieuSC.toLowerCase())
  )
    return false
  if (
    filters.maSanPham &&
    !`${line.maHang} ${line.tenHang}`
      .toLowerCase()
      .includes(filters.maSanPham.toLowerCase())
  )
    return false
  if (
    filters.nsx &&
    !line.nhaSanXuat.toLowerCase().includes(filters.nsx.toLowerCase())
  )
    return false
  return true
}

export function buildCheckoutDetailRows(
  slips: CheckOutSlip[],
  filters: CapLinhKienFilterValues,
): CheckoutDetailRow[] {
  return slips.flatMap((slip) =>
    slip.lines
      .filter((line) => matchesLine(line, filters))
      .map((line, index) => ({
        ...line,
        id: `${slip.id}-${index}`,
        soPhieuCap: slip.soPhieuCap,
        ngayLap: slip.ngayLap,
        kyThuat: slip.kyThuat,
      })),
  )
}

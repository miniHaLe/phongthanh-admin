import type { SellingLine, SellingOrder } from '@/domains/warehouse/types'
import type { BanHangFilterValues } from './ban-hang-filters'

export interface SellingDetailRow extends SellingLine {
  id: string
  soPhieu: string
  ngayLap: string
  khachHang: string
  dienThoai: string
  hinhThucThanhToan: string
  doanhThu: number
  tongGiaVon: number
  loiNhuan: number
}

function matchesLine(line: SellingLine, filters: BanHangFilterValues): boolean {
  if (filters.khoId && line.khoId !== filters.khoId) return false
  if (filters.maHang) {
    const query = filters.maHang.toLowerCase()
    if (!`${line.maHang} ${line.tenHang}`.toLowerCase().includes(query))
      return false
  }
  return true
}

export function buildSellingDetailRows(
  orders: SellingOrder[],
  filters: BanHangFilterValues,
): SellingDetailRow[] {
  return orders.flatMap((order) =>
    order.lines
      .filter((line) => matchesLine(line, filters))
      .map((line, index) => {
        const doanhThu = line.giaBan * line.soLuong
        const tongGiaVon = line.giaVon * line.soLuong
        return {
          ...line,
          id: `${order.id}-${index}`,
          soPhieu: order.soPhieu,
          ngayLap: order.ngayLap,
          khachHang: order.khachHang,
          dienThoai: order.dienThoai,
          hinhThucThanhToan: order.hinhThucThanhToan,
          doanhThu,
          tongGiaVon,
          loiNhuan: doanhThu - tongGiaVon,
        }
      }),
  )
}

export function summarizeSellingProfit(rows: SellingDetailRow[]) {
  return rows.reduce(
    (summary, row) => ({
      doanhThu: summary.doanhThu + row.doanhThu,
      giaVon: summary.giaVon + row.tongGiaVon,
      loiNhuan: summary.loiNhuan + row.loiNhuan,
    }),
    { doanhThu: 0, giaVon: 0, loiNhuan: 0 },
  )
}

/**
 * Ticket-list drill-down for chart-first reports (Phase 7 — owned exclusively).
 * Rendered below a chart after the user clicks a bar/pie segment — shows the
 * underlying RepairTicket rows for that segment via the shared results table.
 */
import type { ColumnDef } from '@tanstack/react-table'
import { ReportResultsTable } from './report-results-table'
import { HINH_THUC_LABEL } from '@/domains/repair/types'
import { formatDate, formatVND } from '@/lib/format'
import type { RepairTicket } from '@/domains/repair/types'
import type { ReportRow } from '@/mock/reports/report-types'

interface ReportDrilldownProps {
  /** Heading shown above the drill-down table. */
  title: string
  tickets: RepairTicket[]
}

const DRILLDOWN_COLUMNS: ColumnDef<ReportRow>[] = [
  { accessorKey: 'stt', header: '#', enableSorting: false },
  { accessorKey: 'urgent', header: '#', enableSorting: false },
  {
    accessorKey: 'soPhieu',
    header: 'Phiếu sửa chữa',
    enableSorting: true,
  },
  { accessorKey: 'khachHang', header: 'Khách hàng', enableSorting: true },
  {
    accessorKey: 'tenSanPham',
    header: 'Thông tin sản phẩm',
    enableSorting: false,
  },
  { accessorKey: 'kyThuat', header: 'Kỹ thuật', enableSorting: true },
  { accessorKey: 'loaiSuaChua', header: 'Loại SC', enableSorting: true },
  {
    accessorKey: 'chiPhi',
    header: 'Chi phí',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'ngayNhan',
    header: 'Ngày nhận',
    enableSorting: true,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'ngayGiao',
    header: 'Ngày giao',
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as string
      return value ? formatDate(value) : ''
    },
  },
  { accessorKey: 'chiTietSuaChua', header: 'Chi tiết SC' },
  { accessorKey: 'ghiChu', header: 'Ghi chú' },
  { accessorKey: 'nguoiNhan', header: 'Người nhận', enableSorting: true },
  { accessorKey: 'khuVuc', header: 'Khu vực', enableSorting: true },
]

function toDrilldownRow(t: RepairTicket, index: number): ReportRow {
  return {
    stt: index + 1,
    urgent: t.isQuick ? 'Gấp' : '',
    soPhieu: t.soPhieu,
    khachHang: t.khachHang.ten,
    tenSanPham: t.tenSanPham,
    kyThuat: t.kyThuat,
    loaiSuaChua: HINH_THUC_LABEL[t.hinhThuc],
    chiPhi: t.chiPhiThucTe,
    ngayNhan: t.ngayNhan,
    ngayGiao: t.ngayGiao ?? '',
    chiTietSuaChua: t.noiDungSuaChua ?? t.cachGiaiQuyet ?? t.moTaLoi ?? '',
    ghiChu: t.ghiChu ?? '',
    nguoiNhan: t.nguoiNhan,
    khuVuc: t.khuVuc ?? '',
  }
}

export function ReportDrilldown({ title, tickets }: ReportDrilldownProps) {
  const rows = tickets.map(toDrilldownRow)
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <ReportResultsTable columns={DRILLDOWN_COLUMNS} data={rows} />
    </div>
  )
}

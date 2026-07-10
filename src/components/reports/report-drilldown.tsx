/**
 * Ticket-list drill-down for chart-first reports (Phase 7 — owned exclusively).
 * Rendered below a chart after the user clicks a bar/pie segment — shows the
 * underlying RepairTicket rows for that segment via the shared results table.
 */
import type { ColumnDef } from '@tanstack/react-table'
import { ReportResultsTable } from './report-results-table'
import { STATUS_LABEL } from '@/domains/repair/status'
import { BRANCH_NAME, type BranchId } from '@/mock/seed/branches'
import { formatDate } from '@/lib/format'
import type { RepairTicket } from '@/domains/repair/types'
import type { ReportRow } from '@/mock/reports/report-types'

interface ReportDrilldownProps {
  /** Heading shown above the drill-down table. */
  title: string
  tickets: RepairTicket[]
}

const DRILLDOWN_COLUMNS: ColumnDef<ReportRow>[] = [
  { accessorKey: 'soPhieu', header: 'Số phiếu', enableSorting: true },
  {
    accessorKey: 'ngayNhan',
    header: 'Ngày nhận',
    enableSorting: true,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  { accessorKey: 'khachHang', header: 'Khách hàng', enableSorting: true },
  { accessorKey: 'tenSanPham', header: 'Thiết bị', enableSorting: false },
  { accessorKey: 'kyThuat', header: 'Kỹ thuật', enableSorting: true },
  { accessorKey: 'chiNhanh', header: 'Chi nhánh', enableSorting: true },
  { accessorKey: 'trangThai', header: 'Tình trạng', enableSorting: true },
]

function toDrilldownRow(t: RepairTicket): ReportRow {
  return {
    soPhieu: t.soPhieu,
    ngayNhan: t.ngayNhan,
    khachHang: t.khachHang.ten,
    tenSanPham: t.tenSanPham,
    kyThuat: t.kyThuat,
    chiNhanh: BRANCH_NAME[t.branchId as BranchId] ?? t.branchId,
    trangThai: STATUS_LABEL[t.tinhTrang],
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

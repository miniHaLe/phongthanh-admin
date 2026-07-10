/**
 * REPORT_CONFIGS array — drives the two local-extra report pages kept per
 * V5 (Xuất Kho, Doanh Thu). The 4 reference-superseded reports were retired
 * from this file: ky-thuat and bao-hanh became bespoke pages, sua-chua/
 * tiep-nhan have no reference-parity route (Phase 7 — owned exclusively).
 */
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { formatVND, formatDate, formatNumber } from '@/lib/format'
import { fetchReportRows } from './sua-chua-report-mock'
import type { ReportConfig, ReportRow, ExportGroup } from './report-types'
import { mockCsvDownload } from '@/components/reports/export-excel-menu'

// ── Shared base filter schema (date range) ────────────────────────────────────

const baseDateSchema = z
  .object({
    tuNgay: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    denNgay: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    chiNhanh: z.string().default('all'),
  })
  .refine((d) => new Date(d.denNgay) >= new Date(d.tuNgay), {
    message: 'Đến ngày phải lớn hơn hoặc bằng từ ngày',
    path: ['denNgay'],
  })

function defaultDateRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  return {
    tuNgay: from.toISOString().slice(0, 10),
    denNgay: to.toISOString().slice(0, 10),
    chiNhanh: 'all',
  }
}

// ── Simple export group builder ────────────────────────────────────────────────

function simpleExportGroup(
  reportTitle: string,
  reportId: string,
): ExportGroup[] {
  return [
    {
      label: 'File báo cáo',
      items: [
        {
          label: 'Xuất Excel File',
          onExport: () =>
            mockCsvDownload(`${reportId}-bao-cao.csv`, reportTitle),
        },
      ],
    },
  ]
}

// ── Báo Cáo Xuất Kho ──────────────────────────────────────────────────────────

const xuatKhoColumns: ColumnDef<ReportRow>[] = [
  { accessorKey: 'soPhieuXuat', header: 'Số phiếu xuất', enableSorting: true },
  {
    accessorKey: 'ngayXuat',
    header: 'Ngày xuất',
    enableSorting: true,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  { accessorKey: 'nhomHangHoa', header: 'Nhóm hàng hóa', enableSorting: true },
  { accessorKey: 'tenHangHoa', header: 'Tên hàng hóa', enableSorting: false },
  {
    accessorKey: 'soLuong',
    header: 'Số lượng',
    enableSorting: true,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'donGia',
    header: 'Đơn giá',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'thanhTien',
    header: 'Thành tiền',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'kyThuatNhanHang',
    header: 'KT nhận hàng',
    enableSorting: true,
  },
  { accessorKey: 'chiNhanh', header: 'Chi nhánh', enableSorting: true },
  { accessorKey: 'lyDoXuat', header: 'Lý do xuất', enableSorting: false },
]

// ── Báo Cáo Doanh Thu ─────────────────────────────────────────────────────────

const doanhThuColumns: ColumnDef<ReportRow>[] = [
  {
    accessorKey: 'ngay',
    header: 'Ngày',
    enableSorting: true,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  { accessorKey: 'chiNhanh', header: 'Chi nhánh', enableSorting: true },
  {
    accessorKey: 'doanhThuSuaChua',
    header: 'DT sửa chữa',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'doanhThuBanHang',
    header: 'DT bán hàng',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'tongDoanhThu',
    header: 'Tổng doanh thu',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'tongChiPhi',
    header: 'Tổng chi phí',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'loiNhuan',
    header: 'Lợi nhuận',
    enableSorting: true,
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'soPhieuSuaChua',
    header: 'Số phiếu SC',
    enableSorting: true,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'soPhieuBanHang',
    header: 'Số phiếu BH',
    enableSorting: true,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
]

// ── REPORT_CONFIGS array (local extras only — V5) ────────────────────────────

export const REPORT_CONFIGS: ReportConfig[] = [
  {
    id: 'xuat-kho',
    title: 'Báo Cáo Xuất Kho',
    filterSchema: baseDateSchema,
    defaultValues: defaultDateRange(),
    columns: xuatKhoColumns,
    queryFn: (params) =>
      fetchReportRows('xuat-kho', params as Record<string, unknown>),
    exportGroups: simpleExportGroup('Báo Cáo Xuất Kho', 'xuat-kho'),
  },
  {
    id: 'doanh-thu',
    title: 'Báo Cáo Doanh Thu',
    filterSchema: baseDateSchema,
    defaultValues: defaultDateRange(),
    columns: doanhThuColumns,
    queryFn: (params) =>
      fetchReportRows('doanh-thu', params as Record<string, unknown>),
    exportGroups: simpleExportGroup('Báo Cáo Doanh Thu', 'doanh-thu'),
  },
]

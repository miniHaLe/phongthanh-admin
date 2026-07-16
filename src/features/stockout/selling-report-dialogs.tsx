import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import type { SellingOrder } from '@/domains/warehouse/types'
import { formatVND } from '@/lib/format'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import type { BanHangFilterValues } from './ban-hang-filters'
import {
  buildSellingDetailRows,
  summarizeSellingProfit,
  type SellingDetailRow,
} from './selling-detail-report'
import {
  VoucherLineDetailDialog,
  type VoucherLineDetailColumn,
} from '@/features/warehouse/voucher-line-detail-dialog'

const DETAIL_COLUMNS: VoucherLineDetailColumn<SellingDetailRow>[] = [
  { header: 'Số phiếu', cell: (row) => row.soPhieu },
  { header: 'Ngày lập', cell: (row) => row.ngayLap.slice(0, 10) },
  { header: 'Khách hàng', cell: (row) => row.khachHang },
  { header: 'Hình thức', cell: (row) => row.hinhThucThanhToan },
  { header: 'Nhà kho', cell: (row) => row.khoTen },
  { header: 'Mã hàng', cell: (row) => row.maHang },
  { header: 'Tên hàng', cell: (row) => row.tenHang },
  { header: 'Model', cell: (row) => row.model || '—' },
  { header: 'Serial', cell: (row) => row.serial || '—' },
  { header: 'Số lượng', cell: (row) => row.soLuong },
  { header: 'Giá bán', cell: (row) => formatVND(row.giaBan) },
  { header: 'Thành tiền', cell: (row) => formatVND(row.doanhThu) },
]

const PROFIT_COLUMNS: VoucherLineDetailColumn<SellingDetailRow>[] = [
  { header: 'Số phiếu', cell: (row) => row.soPhieu },
  { header: 'Mã hàng', cell: (row) => row.maHang },
  { header: 'Tên hàng', cell: (row) => row.tenHang },
  { header: 'Số lượng', cell: (row) => row.soLuong },
  { header: 'Doanh thu', cell: (row) => formatVND(row.doanhThu) },
  { header: 'Giá vốn', cell: (row) => formatVND(row.tongGiaVon) },
  { header: 'Lợi nhuận', cell: (row) => formatVND(row.loiNhuan) },
]

interface SellingReportDialogsProps {
  orders: SellingOrder[]
  filters: BanHangFilterValues
  detailOpen: boolean
  onDetailOpenChange: (open: boolean) => void
  profitOpen: boolean
  onProfitOpenChange: (open: boolean) => void
}

export function SellingReportDialogs({
  orders,
  filters,
  detailOpen,
  onDetailOpenChange,
  profitOpen,
  onProfitOpenChange,
}: SellingReportDialogsProps) {
  const rows = useMemo(
    () => buildSellingDetailRows(orders, filters),
    [filters, orders],
  )
  const summary = useMemo(() => summarizeSellingProfit(rows), [rows])

  async function exportProfit() {
    await exportListXlsx({
      filename: 'bao-cao-loi-nhuan-ban-hang',
      sheetName: 'Lợi Nhuận Bán Hàng',
      columns: [
        { header: 'Số phiếu', accessor: (row: SellingDetailRow) => row.soPhieu },
        { header: 'Ngày lập', accessor: (row: SellingDetailRow) => row.ngayLap },
        { header: 'Mã hàng', accessor: (row: SellingDetailRow) => row.maHang },
        { header: 'Tên hàng', accessor: (row: SellingDetailRow) => row.tenHang },
        { header: 'Số lượng', accessor: (row: SellingDetailRow) => row.soLuong },
        { header: 'Doanh thu', accessor: (row: SellingDetailRow) => row.doanhThu },
        { header: 'Giá vốn', accessor: (row: SellingDetailRow) => row.tongGiaVon },
        { header: 'Lợi nhuận', accessor: (row: SellingDetailRow) => row.loiNhuan },
      ],
      rows,
    })
  }

  return (
    <>
      <VoucherLineDetailDialog
        open={detailOpen}
        onOpenChange={onDetailOpenChange}
        title="Chi tiết bán hàng"
        rows={rows}
        columns={DETAIL_COLUMNS}
        getRowId={(row) => row.id}
        emptyMessage="Không có dòng bán hàng phù hợp"
      />

      <VoucherLineDetailDialog
        open={profitOpen}
        onOpenChange={onProfitOpenChange}
        title="Báo cáo lợi nhuận bán hàng"
        rows={rows}
        columns={PROFIT_COLUMNS}
        getRowId={(row) => row.id}
        emptyMessage="Không có dữ liệu lợi nhuận phù hợp"
        summary={
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span>Doanh thu: {formatVND(summary.doanhThu)}</span>
            <span>Giá vốn: {formatVND(summary.giaVon)}</span>
            <strong>Lợi nhuận: {formatVND(summary.loiNhuan)}</strong>
          </div>
        }
        actions={
          <Button size="sm" onClick={() => void exportProfit()}>
            Xuất Excel
          </Button>
        }
      />
    </>
  )
}

/**
 * Nhập Kho list columns — the verified reference column set (checkbox, 9 data
 * columns, Chọn action cell). Extracted from NhapKhoPage.tsx to keep the page
 * component itself focused.
 */
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { buildSelectionColumn } from '@/components/shared'
import { formatVND, formatDateTime } from '@/lib/format'
import type { ReceivingVoucher } from '@/domains/warehouse/types'
import { ReceivingRowActions } from './receiving-row-actions'

export const NHAP_KHO_TABLE_ID = 'nhap-kho-list'

export function useNhapKhoColumns(): ColumnDef<ReceivingVoucher, unknown>[] {
  return useMemo<ColumnDef<ReceivingVoucher, unknown>[]>(
    () => [
      buildSelectionColumn<ReceivingVoucher>(),
      {
        id: 'soPhieu',
        accessorKey: 'soPhieu',
        header: 'Số phiếu',
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono text-sm font-semibold">
            {row.original.soPhieu}
          </span>
        ),
      },
      {
        id: 'soDatHang',
        accessorKey: 'soDatHang',
        header: 'Số đặt hàng',
        cell: ({ row }) => row.original.soDatHang || '—',
      },
      {
        id: 'soHoaDon',
        accessorKey: 'soHoaDon',
        header: 'Số hóa đơn',
        cell: ({ row }) => row.original.soHoaDon || '—',
      },
      {
        id: 'nhaCungCap',
        accessorKey: 'nhaCungCap',
        header: 'Nhà cung cấp',
      },
      {
        id: 'hinhThucThanhToan',
        accessorKey: 'hinhThucThanhToan',
        header: 'Hình thức thanh toán',
      },
      {
        id: 'khoTen',
        accessorKey: 'khoTen',
        header: 'Nhà kho',
      },
      {
        id: 'soTien',
        accessorKey: 'soTien',
        header: 'Số tiền',
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatVND(row.original.soTien)}
          </span>
        ),
      },
      {
        id: 'nguoiLap',
        accessorKey: 'nguoiLap',
        header: 'Người lập',
      },
      {
        id: 'ngayLap',
        accessorKey: 'ngayLap',
        header: 'Ngày lập',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums">
            {formatDateTime(row.original.ngayLap)}
          </span>
        ),
      },
      {
        id: 'ghiChu',
        accessorKey: 'ghiChu',
        header: 'Ghi Chú',
        cell: ({ row }) => row.original.ghiChu || '—',
      },
      {
        id: 'chon',
        header: 'Chọn',
        enableSorting: false,
        cell: ({ row }) => <ReceivingRowActions row={row.original} />,
      },
    ],
    [],
  )
}

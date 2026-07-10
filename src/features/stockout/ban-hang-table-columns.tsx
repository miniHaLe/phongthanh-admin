/**
 * Bán Hàng list columns — the verified 8-column reference set (checkbox +
 * 7 data columns + Chọn). No Trạng thái column. "Chọn" cell holds Thêm hình,
 * Chỉnh sửa, Xuất kho (print), Chi tiết.
 */
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { buildSelectionColumn } from '@/components/shared'
import { formatVND, formatDateTime } from '@/lib/format'
import type { SellingOrder } from '@/domains/warehouse/types'
import { BanHangRowActions } from './ban-hang-row-actions'

export const BAN_HANG_TABLE_ID = 'ban-hang-list'

export function useBanHangColumns(): ColumnDef<SellingOrder, unknown>[] {
  return useMemo<ColumnDef<SellingOrder, unknown>[]>(
    () => [
      buildSelectionColumn<SellingOrder>(),
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
        id: 'ngayLap',
        accessorKey: 'ngayLap',
        header: 'Ngày lập',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums">
            {formatDateTime(row.original.ngayLap)}
          </span>
        ),
      },
      { id: 'khachHang', accessorKey: 'khachHang', header: 'Khách hàng' },
      { id: 'dienThoai', accessorKey: 'dienThoai', header: 'Điện thoại' },
      {
        id: 'tongTien',
        accessorKey: 'tongTien',
        header: 'Tổng tiền',
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatVND(row.original.tongTien)}
          </span>
        ),
      },
      { id: 'nguoiLap', accessorKey: 'nguoiLap', header: 'Người lập' },
      {
        id: 'ghiChu',
        accessorKey: 'ghiChu',
        header: 'Ghi chú',
        cell: ({ row }) => row.original.ghiChu || '—',
      },
      {
        id: 'chon',
        header: 'Chọn',
        enableSorting: false,
        cell: ({ row }) => <BanHangRowActions row={row.original} />,
      },
    ],
    [],
  )
}

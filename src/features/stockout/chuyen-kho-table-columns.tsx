/**
 * Chuyển Kho list columns — the verified 10-column reference set (checkbox +
 * Trạng thái lead + 8 data columns + Chọn).
 */
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { buildSelectionColumn } from '@/components/shared'
import { formatDateTime } from '@/lib/format'
import type { MovingSlip, ChuyenKhoTrangThai } from '@/domains/warehouse/types'
import { ChuyenKhoRowActions } from './chuyen-kho-row-actions'

export const CHUYEN_KHO_TABLE_ID = 'chuyen-kho-list'

const TRANG_THAI_CLASS: Record<ChuyenKhoTrangThai, string> = {
  'Chưa xác nhận': 'bg-amber-100 text-amber-900',
  'Đã xác nhận': 'bg-emerald-100 text-emerald-900',
  'Không xác nhận': 'bg-red-100 text-red-900',
}

export function useChuyenKhoColumns(): ColumnDef<MovingSlip, unknown>[] {
  return useMemo<ColumnDef<MovingSlip, unknown>[]>(
    () => [
      buildSelectionColumn<MovingSlip>(),
      {
        id: 'trangThai',
        accessorKey: 'trangThai',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <span
            className={`whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-semibold ${TRANG_THAI_CLASS[row.original.trangThai]}`}
          >
            {row.original.trangThai}
          </span>
        ),
      },
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
      { id: 'tuChiNhanh', accessorKey: 'tuChiNhanh', header: 'Từ chi nhánh' },
      { id: 'tuKho', accessorKey: 'tuKho', header: 'Từ kho' },
      { id: 'denChiNhanh', accessorKey: 'denChiNhanh', header: 'Đến chi nhánh' },
      { id: 'denKho', accessorKey: 'denKho', header: 'Đến kho' },
      { id: 'loai', accessorKey: 'loai', header: 'Loại' },
      { id: 'nguoiChuyen', accessorKey: 'nguoiChuyen', header: 'Người chuyển' },
      {
        id: 'chon',
        header: 'Chọn',
        enableSorting: false,
        cell: ({ row }) => <ChuyenKhoRowActions row={row.original} />,
      },
    ],
    [],
  )
}

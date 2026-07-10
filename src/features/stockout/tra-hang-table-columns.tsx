/**
 * Trả Hàng list columns — the verified 5-column reference set (checkbox +
 * 4 data columns + Chọn implied by row actions). "Chọn" cell holds Chỉnh sửa,
 * print, Chi tiết.
 */
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { buildSelectionColumn } from '@/components/shared'
import { formatDateTime } from '@/lib/format'
import type { ReturnSlip } from '@/domains/warehouse/types'
import { TraHangRowActions } from './tra-hang-row-actions'

export const TRA_HANG_TABLE_ID = 'tra-hang-list'

export function useTraHangColumns(): ColumnDef<ReturnSlip, unknown>[] {
  return useMemo<ColumnDef<ReturnSlip, unknown>[]>(
    () => [
      buildSelectionColumn<ReturnSlip>(),
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
        id: 'ngayTra',
        accessorKey: 'ngayTra',
        header: 'Ngày trả',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums">
            {formatDateTime(row.original.ngayTra)}
          </span>
        ),
      },
      { id: 'hinhThucTra', accessorKey: 'hinhThucTra', header: 'Hình thức trả' },
      { id: 'nguoiLap', accessorKey: 'nguoiLap', header: 'Người lập' },
      {
        id: 'chon',
        header: 'Chọn',
        enableSorting: false,
        cell: ({ row }) => <TraHangRowActions row={row.original} />,
      },
    ],
    [],
  )
}

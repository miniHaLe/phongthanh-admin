/**
 * DSTraLKXac (Danh sách trả linh kiện xác) — verified 20-column reference set.
 */
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { buildSelectionColumn } from '@/components/shared'
import { formatDate } from '@/lib/format'
import type { PartReturnXac } from '@/domains/warehouse/types'

export const PART_RETURN_XAC_TABLE_ID = 'part-return-xac-list'

export function usePartReturnXacColumns(): ColumnDef<PartReturnXac, unknown>[] {
  return useMemo<ColumnDef<PartReturnXac, unknown>[]>(
    () => [
      {
        id: 'stt',
        header: '##',
        enableSorting: false,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.index + 1}</span>,
      },
      buildSelectionColumn<PartReturnXac>(),
      {
        id: 'tinhTrang',
        accessorKey: 'tinhTrang',
        header: 'Tình trạng',
        cell: ({ row }) => (
          <span
            className={
              row.original.tinhTrang === 'Đã trả hãng'
                ? 'font-medium text-emerald-600'
                : 'font-medium text-amber-600'
            }
          >
            {row.original.tinhTrang}
          </span>
        ),
      },
      {
        id: 'maVanDon',
        accessorKey: 'maVanDon',
        header: 'Mã vận đơn',
        cell: ({ row }) => (
          <span className="text-blue-600">{row.original.maVanDon || '—'}</span>
        ),
      },
      { id: 'soPhieuCap', accessorKey: 'soPhieuCap', header: 'Số phiếu cấp' },
      { id: 'soPhieuSC', accessorKey: 'soPhieuSC', header: 'Số phiếu SC' },
      { id: 'soPhieuHang', accessorKey: 'soPhieuHang', header: 'Số phiếu hãng' },
      { id: 'model', accessorKey: 'model', header: 'Model' },
      { id: 'serial', accessorKey: 'serial', header: 'Serial' },
      { id: 'nhaKho', accessorKey: 'nhaKho', header: 'Nhà kho' },
      { id: 'nsx', accessorKey: 'nsx', header: 'NSX' },
      { id: 'maHang', accessorKey: 'maHang', header: 'Mã hàng' },
      { id: 'tenHang', accessorKey: 'tenHang', header: 'Tên hàng' },
      { id: 'kyThuat', accessorKey: 'kyThuat', header: 'Kĩ thuật' },
      { id: 'mucDich', accessorKey: 'mucDich', header: 'Mục đích' },
      {
        id: 'ngayTX',
        accessorKey: 'ngayTX',
        header: 'Ngày TX',
        cell: ({ row }) => (row.original.ngayTX ? formatDate(row.original.ngayTX) : '—'),
      },
      {
        id: 'nguoiTX',
        accessorKey: 'nguoiTX',
        header: 'Người TX',
        cell: ({ row }) => row.original.nguoiTX || '—',
      },
      { id: 'sl', accessorKey: 'sl', header: 'SL' },
      {
        id: 'ngayTao',
        accessorKey: 'ngayTao',
        header: 'Ngày tạo',
        cell: ({ row }) => formatDate(row.original.ngayTao),
      },
      { id: 'nguoiTao', accessorKey: 'nguoiTao', header: 'Người tạo' },
    ],
    [],
  )
}

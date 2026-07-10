/**
 * Cấp Linh Kiện list columns — the verified 7-column reference set (no
 * checkbox, no per-row edit). "Chọn" cell holds Chi tiết + print only.
 */
import { useMemo, useState } from 'react'
import { Eye, Printer } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatVND, formatDateTime } from '@/lib/format'
import type { CheckOutSlip } from '@/domains/warehouse/types'
import { printCapLKKyThuat } from './prints/stockout-prints'
import { VoucherDetailModal } from './voucher-detail-modal'

export const CAP_LINH_KIEN_TABLE_ID = 'cap-linh-kien-list'

function CapLinhKienRowActions({ row }: { row: CheckOutSlip }) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="In"
        onClick={() => void printCapLKKyThuat(row)}
      >
        <Printer className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Chi tiết"
        onClick={() => setDetailOpen(true)}
      >
        <Eye className="size-4" />
      </Button>
      {detailOpen && (
        <VoucherDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={`Chi tiết phiếu ${row.soPhieuCap}`}
          rows={[
            { label: 'Số phiếu cấp', value: row.soPhieuCap },
            { label: 'Ngày lập', value: formatDateTime(row.ngayLap) },
            { label: 'Kỹ thuật', value: row.kyThuat },
            { label: 'Số tiền', value: formatVND(row.soTien) },
            { label: 'Người lập', value: row.nguoiLap },
            { label: 'Ghi chú', value: row.ghiChu || '—' },
          ]}
        />
      )}
    </div>
  )
}

export function useCapLinhKienColumns(): ColumnDef<CheckOutSlip, unknown>[] {
  return useMemo<ColumnDef<CheckOutSlip, unknown>[]>(
    () => [
      {
        id: 'soPhieuCap',
        accessorKey: 'soPhieuCap',
        header: 'Số phiếu cấp',
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono text-sm font-semibold">
            {row.original.soPhieuCap}
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
      { id: 'kyThuat', accessorKey: 'kyThuat', header: 'Kỹ thuật' },
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
        cell: ({ row }) => <CapLinhKienRowActions row={row.original} />,
      },
    ],
    [],
  )
}

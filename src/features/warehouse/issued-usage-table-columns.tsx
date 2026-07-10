/**
 * Danh sách sử dụng linh kiện (issued-part usage) — the verified 21-column
 * reference set. "Số phiếu hãng" embeds a color-coded ticket-status badge;
 * "SL Trả" renders in red; "Tình trạng" is the state-dependent action cell.
 */
import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { STATUS_HEX, STATUS_LABEL } from '@/domains/repair/status'
import type { IssuedPartUsage } from '@/domains/warehouse/types'
import { IssuedUsageStatusCell } from './issued-usage-status-cell'
import { VoucherDetailModal } from './voucher-detail-modal'

export const ISSUED_USAGE_TABLE_ID = 'issued-usage-list'

function DetailAction({ row }: { row: IssuedPartUsage }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Chi tiết"
        onClick={() => setOpen(true)}
      >
        <Eye className="size-4" />
      </Button>
      {open && (
        <VoucherDetailModal
          open={open}
          onOpenChange={setOpen}
          title={`Chi tiết phiếu cấp ${row.soPhieuCap}`}
          rows={[
            { label: 'Tình trạng', value: row.tinhTrang },
            { label: 'Số phiếu cấp', value: row.soPhieuCap },
            { label: 'Số phiếu SC', value: row.soPhieuSC },
            { label: 'Số phiếu hãng', value: row.soPhieuHang },
            { label: 'Model', value: row.model },
            { label: 'Serial', value: row.serial },
            { label: 'NSX', value: row.nsx },
            { label: 'Nhà kho', value: row.nhaKho },
            { label: 'Mã hàng', value: row.maHang },
            { label: 'Tên hàng', value: row.tenHang },
            { label: 'Kĩ thuật', value: row.kyThuat },
            { label: 'Mục đích', value: row.mucDich },
            { label: 'Ngày cấp', value: formatDate(row.ngayCap) },
            { label: 'Người cấp', value: row.nguoiCap },
            { label: 'Ngày giao', value: row.ngayGiao ? formatDate(row.ngayGiao) : '—' },
            { label: 'Ngày TX', value: row.ngayTX ? formatDate(row.ngayTX) : '—' },
            { label: 'Người TX', value: row.nguoiTX || '—' },
            { label: 'Số lượng cấp', value: row.soLuongCap },
            { label: 'SL Trả', value: row.slTra },
          ]}
        />
      )}
    </>
  )
}

export function useIssuedUsageColumns(): ColumnDef<IssuedPartUsage, unknown>[] {
  return useMemo<ColumnDef<IssuedPartUsage, unknown>[]>(
    () => [
      {
        id: 'stt',
        header: '##',
        enableSorting: false,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.index + 1}</span>,
      },
      {
        id: 'tinhTrang',
        header: 'Tình trạng',
        enableSorting: false,
        cell: ({ row }) => <IssuedUsageStatusCell row={row.original} />,
      },
      { id: 'soPhieuCap', accessorKey: 'soPhieuCap', header: 'Số phiếu cấp' },
      { id: 'soPhieuSC', accessorKey: 'soPhieuSC', header: 'Số phiếu SC' },
      {
        id: 'soPhieuHang',
        accessorKey: 'soPhieuHang',
        header: 'Số phiếu hãng',
        cell: ({ row }) => {
          const t = row.original
          return (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_HEX[t.ticketStatusId] }}
                aria-hidden="true"
                title={STATUS_LABEL[t.ticketStatusId]}
              />
              {t.soPhieuHang}
            </span>
          )
        },
      },
      { id: 'model', accessorKey: 'model', header: 'Model' },
      { id: 'serial', accessorKey: 'serial', header: 'Serial' },
      { id: 'nsx', accessorKey: 'nsx', header: 'NSX' },
      { id: 'nhaKho', accessorKey: 'nhaKho', header: 'Nhà kho' },
      { id: 'maHang', accessorKey: 'maHang', header: 'Mã hàng' },
      { id: 'tenHang', accessorKey: 'tenHang', header: 'Tên hàng' },
      { id: 'kyThuat', accessorKey: 'kyThuat', header: 'Kĩ thuật' },
      { id: 'mucDich', accessorKey: 'mucDich', header: 'Mục đích' },
      {
        id: 'ngayCap',
        accessorKey: 'ngayCap',
        header: 'Ngày cấp',
        cell: ({ row }) => formatDate(row.original.ngayCap),
      },
      { id: 'nguoiCap', accessorKey: 'nguoiCap', header: 'Người cấp' },
      {
        id: 'ngayGiao',
        accessorKey: 'ngayGiao',
        header: 'Ngày giao',
        cell: ({ row }) => (row.original.ngayGiao ? formatDate(row.original.ngayGiao) : '—'),
      },
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
      { id: 'soLuongCap', accessorKey: 'soLuongCap', header: 'Số lượng cấp' },
      {
        id: 'slTra',
        accessorKey: 'slTra',
        header: 'SL Trả',
        cell: ({ row }) => (
          <span className="font-medium text-destructive">{row.original.slTra}</span>
        ),
      },
      {
        id: 'chon',
        header: 'Chọn',
        enableSorting: false,
        cell: ({ row }) => <DetailAction row={row.original} />,
      },
    ],
    [],
  )
}

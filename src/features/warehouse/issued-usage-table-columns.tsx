import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import { formatDate } from '@/lib/format'
import { STATUS_HEX, STATUS_LABEL } from '@/domains/repair/status'
import type { IssuedPartUsage } from '@/domains/warehouse/types'
import { IssuedUsageStatusCell } from './issued-usage-status-cell'
import { VoucherDetailModal } from './voucher-detail-modal'

export const ISSUED_USAGE_TABLE_ID = 'issued-usage-list'

const metaLabelClass = 'text-xs font-medium text-muted-foreground'

function sortOnlyColumn(
  id: keyof IssuedPartUsage,
  label: string,
): ColumnDef<IssuedPartUsage, unknown> {
  return {
    id,
    accessorFn: (row) => row[id],
    header: label,
    meta: { presentation: 'sort-only' },
  }
}

function protectedValue(value: string | number, tabular = false) {
  return (
    <TableProtectedValue tabular={tabular}>{String(value)}</TableProtectedValue>
  )
}

function DetailAction({ row }: { row: IssuedPartUsage }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 lg:h-7 lg:w-7"
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
            {
              label: 'Ngày giao',
              value: row.ngayGiao ? formatDate(row.ngayGiao) : '—',
            },
            {
              label: 'Ngày TX',
              value: row.ngayTX ? formatDate(row.ngayTX) : '—',
            },
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
        id: 'statusActions',
        header: 'Trạng thái / Thao tác',
        size: 150,
        enableSorting: false,
        meta: {
          compositeSortOptions: [{ id: 'tinhTrang', label: 'Tình trạng' }],
        },
        cell: ({ row }) => <IssuedUsageStatusCell row={row.original} />,
      },
      {
        id: 'voucherRefs',
        header: 'Tham chiếu phiếu',
        size: 240,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'soPhieuCap', label: 'Số phiếu cấp' },
            { id: 'soPhieuSC', label: 'Số phiếu sửa chữa' },
            { id: 'soPhieuHang', label: 'Số phiếu hãng' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Phiếu cấp</span>
            {protectedValue(row.original.soPhieuCap)}
            <span className={metaLabelClass}>Phiếu SC</span>
            {protectedValue(row.original.soPhieuSC)}
            <span className={metaLabelClass}>Phiếu hãng</span>
            <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: STATUS_HEX[row.original.ticketStatusId],
                }}
                aria-hidden="true"
              />
              <span className="text-xs leading-tight text-muted-foreground">
                {STATUS_LABEL[row.original.ticketStatusId]}
              </span>
              <TableProtectedValue className="shrink-0">
                {row.original.soPhieuHang}
              </TableProtectedValue>
            </span>
          </TableMetaStack>
        ),
      },
      {
        id: 'itemIdentity',
        header: 'Thông tin linh kiện',
        size: 290,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'maHang', label: 'Mã hàng' },
            { id: 'tenHang', label: 'Tên hàng' },
            { id: 'model', label: 'Model' },
            { id: 'serial', label: 'Serial' },
            { id: 'nsx', label: 'Nhà sản xuất' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Mã</span>
            {protectedValue(row.original.maHang)}
            <span className={metaLabelClass}>Tên</span>
            <TableDescription value={row.original.tenHang} />
            <span className={metaLabelClass}>Model</span>
            {protectedValue(row.original.model)}
            <span className={metaLabelClass}>Serial</span>
            {protectedValue(row.original.serial)}
            <span className={metaLabelClass}>NSX</span>
            <TableDescription value={row.original.nsx} />
          </TableMetaStack>
        ),
      },
      {
        id: 'location',
        header: 'Vị trí',
        size: 130,
        enableSorting: false,
        meta: {
          compositeSortOptions: [{ id: 'nhaKho', label: 'Nhà kho' }],
        },
        cell: ({ row }) => <TableDescription value={row.original.nhaKho} />,
      },
      {
        id: 'assignment',
        header: 'Phân công',
        size: 180,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'kyThuat', label: 'Kỹ thuật' },
            { id: 'mucDich', label: 'Mục đích' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Kỹ thuật</span>
            <TableDescription value={row.original.kyThuat} />
            <span className={metaLabelClass}>Mục đích</span>
            <TableDescription value={row.original.mucDich} />
          </TableMetaStack>
        ),
      },
      {
        id: 'issue',
        header: 'Cấp linh kiện',
        size: 200,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ngayCap', label: 'Ngày cấp' },
            { id: 'nguoiCap', label: 'Người cấp' },
            { id: 'soLuongCap', label: 'Số lượng cấp' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Ngày</span>
            {protectedValue(formatDate(row.original.ngayCap), true)}
            <span className={metaLabelClass}>Người cấp</span>
            <TableDescription value={row.original.nguoiCap} />
            <span className={metaLabelClass}>Số lượng</span>
            {protectedValue(row.original.soLuongCap, true)}
          </TableMetaStack>
        ),
      },
      {
        id: 'delivery',
        header: 'Giao',
        size: 120,
        enableSorting: false,
        meta: {
          compositeSortOptions: [{ id: 'ngayGiao', label: 'Ngày giao' }],
        },
        cell: ({ row }) =>
          protectedValue(
            row.original.ngayGiao ? formatDate(row.original.ngayGiao) : '—',
            true,
          ),
      },
      {
        id: 'recovery',
        header: 'Thu hồi',
        size: 180,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ngayTX', label: 'Ngày thu xác' },
            { id: 'nguoiTX', label: 'Người thu xác' },
            { id: 'slTra', label: 'Số lượng trả' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Ngày TX</span>
            {protectedValue(
              row.original.ngayTX ? formatDate(row.original.ngayTX) : '—',
              true,
            )}
            <span className={metaLabelClass}>Người TX</span>
            <TableDescription value={row.original.nguoiTX || '—'} />
            <span className={metaLabelClass}>SL trả</span>
            <TableProtectedValue
              className="font-medium text-destructive"
              tabular
            >
              {row.original.slTra}
            </TableProtectedValue>
          </TableMetaStack>
        ),
      },
      {
        id: 'detail',
        header: 'Chi tiết',
        size: 70,
        enableSorting: false,
        cell: ({ row }) => <DetailAction row={row.original} />,
      },
      sortOnlyColumn('tinhTrang', 'Tình trạng'),
      sortOnlyColumn('soPhieuCap', 'Số phiếu cấp'),
      sortOnlyColumn('soPhieuSC', 'Số phiếu sửa chữa'),
      sortOnlyColumn('soPhieuHang', 'Số phiếu hãng'),
      sortOnlyColumn('maHang', 'Mã hàng'),
      sortOnlyColumn('tenHang', 'Tên hàng'),
      sortOnlyColumn('model', 'Model'),
      sortOnlyColumn('serial', 'Serial'),
      sortOnlyColumn('nsx', 'Nhà sản xuất'),
      sortOnlyColumn('nhaKho', 'Nhà kho'),
      sortOnlyColumn('kyThuat', 'Kỹ thuật'),
      sortOnlyColumn('mucDich', 'Mục đích'),
      sortOnlyColumn('ngayCap', 'Ngày cấp'),
      sortOnlyColumn('nguoiCap', 'Người cấp'),
      sortOnlyColumn('soLuongCap', 'Số lượng cấp'),
      sortOnlyColumn('ngayGiao', 'Ngày giao'),
      sortOnlyColumn('ngayTX', 'Ngày thu xác'),
      sortOnlyColumn('nguoiTX', 'Người thu xác'),
      sortOnlyColumn('slTra', 'Số lượng trả'),
    ],
    [],
  )
}

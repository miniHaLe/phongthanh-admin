import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import { formatDate } from '@/lib/format'
import type { PartReturnXac } from '@/domains/warehouse/types'

export const PART_RETURN_XAC_TABLE_ID = 'part-return-xac-list'

const metaLabelClass = 'text-xs font-medium text-muted-foreground'

function sortOnlyColumn(
  id: keyof PartReturnXac,
  label: string,
): ColumnDef<PartReturnXac, unknown> {
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

export function usePartReturnXacColumns(): ColumnDef<PartReturnXac, unknown>[] {
  return useMemo<ColumnDef<PartReturnXac, unknown>[]>(
    () => [
      {
        id: 'selectIndex',
        header: ({ table }) => (
          <span className="inline-flex min-h-11 min-w-11 items-center justify-center lg:min-h-4 lg:min-w-4">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(checked) =>
                table.toggleAllPageRowsSelected(checked === true)
              }
              aria-label="Chọn tất cả"
            />
          </span>
        ),
        size: 80,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span className="inline-flex min-h-11 min-w-11 items-center justify-center lg:min-h-4 lg:min-w-4">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(checked) =>
                  row.toggleSelected(checked === true)
                }
                aria-label={`Chọn dòng ${row.index + 1}`}
              />
            </span>
            <TableProtectedValue
              tabular
              className="text-xs text-muted-foreground"
            >
              {row.index + 1}
            </TableProtectedValue>
          </div>
        ),
      },
      {
        id: 'statusTracking',
        header: 'Trạng thái / Vận đơn',
        size: 160,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'tinhTrang', label: 'Tình trạng' },
            { id: 'maVanDon', label: 'Mã vận đơn' },
          ],
        },
        cell: ({ row }) => (
          <div className="space-y-1">
            <span
              className={
                row.original.tinhTrang === 'Đã trả hãng'
                  ? 'block font-medium text-emerald-600'
                  : 'block font-medium text-amber-600'
              }
            >
              {row.original.tinhTrang}
            </span>
            <TableProtectedValue className="text-blue-600">
              {row.original.maVanDon || '—'}
            </TableProtectedValue>
          </div>
        ),
      },
      {
        id: 'voucherRefs',
        header: 'Tham chiếu phiếu',
        size: 250,
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
            {protectedValue(row.original.soPhieuHang)}
          </TableMetaStack>
        ),
      },
      {
        id: 'itemLocation',
        header: 'Linh kiện / Vị trí',
        size: 360,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'maHang', label: 'Mã hàng' },
            { id: 'tenHang', label: 'Tên hàng' },
            { id: 'model', label: 'Model' },
            { id: 'serial', label: 'Serial' },
            { id: 'nsx', label: 'Nhà sản xuất' },
            { id: 'nhaKho', label: 'Nhà kho' },
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
            <span className={metaLabelClass}>Nhà kho</span>
            <TableDescription value={row.original.nhaKho} />
          </TableMetaStack>
        ),
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
        id: 'recovery',
        header: 'Thu xác',
        size: 180,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ngayTX', label: 'Ngày thu xác' },
            { id: 'nguoiTX', label: 'Người thu xác' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Ngày</span>
            {protectedValue(
              row.original.ngayTX ? formatDate(row.original.ngayTX) : '—',
              true,
            )}
            <span className={metaLabelClass}>Người TX</span>
            <TableDescription value={row.original.nguoiTX || '—'} />
          </TableMetaStack>
        ),
      },
      {
        id: 'quantity',
        header: 'Số lượng',
        size: 90,
        enableSorting: false,
        meta: { compositeSortOptions: [{ id: 'sl', label: 'Số lượng' }] },
        cell: ({ row }) => protectedValue(row.original.sl, true),
      },
      {
        id: 'created',
        header: 'Tạo phiếu',
        size: 180,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ngayTao', label: 'Ngày tạo' },
            { id: 'nguoiTao', label: 'Người tạo' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Ngày</span>
            {protectedValue(formatDate(row.original.ngayTao), true)}
            <span className={metaLabelClass}>Người tạo</span>
            <TableDescription value={row.original.nguoiTao} />
          </TableMetaStack>
        ),
      },
      sortOnlyColumn('tinhTrang', 'Tình trạng'),
      sortOnlyColumn('maVanDon', 'Mã vận đơn'),
      sortOnlyColumn('soPhieuCap', 'Số phiếu cấp'),
      sortOnlyColumn('soPhieuSC', 'Số phiếu sửa chữa'),
      sortOnlyColumn('soPhieuHang', 'Số phiếu hãng'),
      sortOnlyColumn('maHang', 'Mã hàng'),
      sortOnlyColumn('tenHang', 'Tên hàng'),
      sortOnlyColumn('model', 'Model'),
      sortOnlyColumn('serial', 'Serial'),
      sortOnlyColumn('nhaKho', 'Nhà kho'),
      sortOnlyColumn('nsx', 'Nhà sản xuất'),
      sortOnlyColumn('kyThuat', 'Kỹ thuật'),
      sortOnlyColumn('mucDich', 'Mục đích'),
      sortOnlyColumn('ngayTX', 'Ngày thu xác'),
      sortOnlyColumn('nguoiTX', 'Người thu xác'),
      sortOnlyColumn('sl', 'Số lượng'),
      sortOnlyColumn('ngayTao', 'Ngày tạo'),
      sortOnlyColumn('nguoiTao', 'Người tạo'),
    ],
    [],
  )
}

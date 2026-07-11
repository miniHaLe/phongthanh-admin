import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import type { InventoryRow } from '@/domains/warehouse/types'
import { formatNumber, formatVND } from '@/lib/format'
import { BRANCHES } from '@/mock/seed/branches'

interface InventoryCompositeColumnOptions {
  page: number
  pageSize: number
  showTotal?: boolean
  onEdit: (row: InventoryRow) => void
  onDetail: (row: InventoryRow) => void
}

const metaLabelClass = 'text-xs font-medium text-muted-foreground'

function sortOnlyColumn(
  id: keyof InventoryRow,
  label: string,
): ColumnDef<InventoryRow, unknown> {
  return {
    id,
    accessorFn: (row) => row[id],
    header: label,
    meta: { presentation: 'sort-only' },
  }
}

function protectedText(value: string, tabular = false) {
  return <TableProtectedValue tabular={tabular}>{value}</TableProtectedValue>
}

export function useInventoryCompositeColumns({
  page,
  pageSize,
  showTotal = true,
  onEdit,
  onDetail,
}: InventoryCompositeColumnOptions): ColumnDef<InventoryRow, unknown>[] {
  return useMemo(
    () => [
      {
        id: 'indexActions',
        header: 'STT / Thao tác',
        size: 104,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <TableProtectedValue
              className="w-7 text-center text-xs text-muted-foreground"
              tabular
            >
              {(page - 1) * pageSize + row.index + 1}
            </TableProtectedValue>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 lg:h-7 lg:w-7"
              aria-label="Cập nhật"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 lg:h-7 lg:w-7"
              aria-label="Xem chi tiết"
              onClick={() => onDetail(row.original)}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
      },
      {
        id: 'location',
        header: 'Vị trí',
        size: 190,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'branchId', label: 'Chi nhánh' },
            { id: 'khoTen', label: 'Nhà kho' },
            { id: 'nganChua', label: 'Ngăn chứa' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Chi nhánh</span>
            <TableDescription
              value={
                BRANCHES.find((branch) => branch.id === row.original.branchId)
                  ?.name ?? row.original.branchId
              }
            />
            <span className={metaLabelClass}>Nhà kho</span>
            <TableDescription value={row.original.khoTen} />
            <span className={metaLabelClass}>Ngăn</span>
            <TableDescription value={row.original.nganChua} />
          </TableMetaStack>
        ),
      },
      {
        id: 'itemIdentity',
        header: 'Thông tin hàng',
        size: 320,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'maHang', label: 'Mã hàng' },
            { id: 'tenHang', label: 'Tên hàng' },
            { id: 'nhomHang', label: 'Nhóm hàng' },
            { id: 'model', label: 'Model' },
            { id: 'nhaSanXuat', label: 'Nhà sản xuất' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Mã</span>
            {protectedText(row.original.maHang)}
            <span className={metaLabelClass}>Tên</span>
            <TableDescription value={row.original.tenHang} />
            <span className={metaLabelClass}>Nhóm</span>
            <TableDescription value={row.original.nhomHang} />
            <span className={metaLabelClass}>Model</span>
            {protectedText(row.original.model)}
            <span className={metaLabelClass}>NSX</span>
            <TableDescription value={row.original.nhaSanXuat} />
            <span className={metaLabelClass}>Serial</span>
            {protectedText(row.original.coSerial ? 'Có' : 'Không')}
          </TableMetaStack>
        ),
      },
      {
        id: 'opening',
        header: 'Đầu kỳ',
        size: 190,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'giaVonDauKy', label: 'Giá vốn đầu kỳ' },
            { id: 'tonDauKy', label: 'Tồn đầu kỳ' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Giá vốn</span>
            {protectedText(formatVND(row.original.giaVonDauKy), true)}
            <span className={metaLabelClass}>Số lượng</span>
            {protectedText(formatNumber(row.original.tonDauKy), true)}
          </TableMetaStack>
        ),
      },
      {
        id: 'movement',
        header: 'Phát sinh',
        size: 170,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'nhapTrongKy', label: 'Nhập trong kỳ' },
            { id: 'xuatTrongKy', label: 'Xuất trong kỳ' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Nhập</span>
            {protectedText(formatNumber(row.original.nhapTrongKy), true)}
            <span className={metaLabelClass}>Xuất</span>
            {protectedText(formatNumber(row.original.xuatTrongKy), true)}
          </TableMetaStack>
        ),
      },
      {
        id: 'closing',
        header: 'Cuối kỳ',
        size: showTotal ? 270 : 220,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ton', label: 'Tồn' },
            { id: 'giaVonTrongKy', label: 'Giá vốn trong kỳ' },
            { id: 'tonCuoiKy', label: 'Tồn cuối kỳ' },
            ...(showTotal ? [{ id: 'tongTien', label: 'Tổng tiền' }] : []),
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Tồn</span>
            {protectedText(formatNumber(row.original.ton), true)}
            <span className={metaLabelClass}>Giá vốn</span>
            {protectedText(formatVND(row.original.giaVonTrongKy), true)}
            <span className={metaLabelClass}>Số lượng</span>
            {protectedText(formatNumber(row.original.tonCuoiKy), true)}
            {showTotal && (
              <>
                <span className={metaLabelClass}>Tổng tiền</span>
                {protectedText(formatVND(row.original.tongTien), true)}
              </>
            )}
          </TableMetaStack>
        ),
      },
      {
        id: 'period',
        header: 'Kỳ',
        size: 90,
        enableSorting: false,
        meta: {
          compositeSortOptions: [{ id: 'kyLabel', label: 'Kỳ' }],
        },
        cell: ({ row }) => protectedText(row.original.kyLabel),
      },
      sortOnlyColumn('branchId', 'Chi nhánh'),
      sortOnlyColumn('khoTen', 'Nhà kho'),
      sortOnlyColumn('nganChua', 'Ngăn chứa'),
      sortOnlyColumn('maHang', 'Mã hàng'),
      sortOnlyColumn('tenHang', 'Tên hàng'),
      sortOnlyColumn('nhomHang', 'Nhóm hàng'),
      sortOnlyColumn('model', 'Model'),
      sortOnlyColumn('nhaSanXuat', 'Nhà sản xuất'),
      sortOnlyColumn('giaVonDauKy', 'Giá vốn đầu kỳ'),
      sortOnlyColumn('tonDauKy', 'Tồn đầu kỳ'),
      sortOnlyColumn('nhapTrongKy', 'Nhập trong kỳ'),
      sortOnlyColumn('xuatTrongKy', 'Xuất trong kỳ'),
      sortOnlyColumn('ton', 'Tồn'),
      sortOnlyColumn('giaVonTrongKy', 'Giá vốn trong kỳ'),
      sortOnlyColumn('tonCuoiKy', 'Tồn cuối kỳ'),
      ...(showTotal ? [sortOnlyColumn('tongTien', 'Tổng tiền')] : []),
      sortOnlyColumn('kyLabel', 'Kỳ'),
    ],
    [onDetail, onEdit, page, pageSize, showTotal],
  )
}

import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { notify } from '@/components/shared'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import { formatDate } from '@/lib/format'
import { duyetTraLK } from '@/domains/warehouse/mock-mutations'
import type { PartReturn } from '@/domains/warehouse/types'

export const PART_RETURN_TABLE_ID = 'part-return-list'

const metaLabelClass = 'text-xs font-medium text-muted-foreground'

function sortOnlyColumn(
  id: keyof PartReturn,
  label: string,
): ColumnDef<PartReturn, unknown> {
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

function DuyetRowAction({ row }: { row: PartReturn }) {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => duyetTraLK([row.id]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-return-list'] })
      notify.success('Duyệt thành công!')
      setConfirmOpen(false)
    },
  })

  if (row.tinhTrang !== 'Chờ duyệt') return null

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="min-h-11 whitespace-nowrap px-2 text-xs lg:min-h-7"
        onClick={() => setConfirmOpen(true)}
      >
        Duyệt
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyệt trả linh kiện</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắn chắn Duyệt trả linh kiện?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => mutation.mutate()}>
              Đã nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function usePartReturnColumns(): ColumnDef<PartReturn, unknown>[] {
  return useMemo<ColumnDef<PartReturn, unknown>[]>(
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
        id: 'statusAction',
        header: 'Trạng thái / Duyệt',
        size: 150,
        enableSorting: false,
        meta: {
          compositeSortOptions: [{ id: 'tinhTrang', label: 'Tình trạng' }],
        },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span
              className={
                row.original.tinhTrang === 'Đã duyệt'
                  ? 'font-medium text-emerald-600'
                  : 'font-medium text-amber-600'
              }
            >
              {row.original.tinhTrang}
            </span>
            <DuyetRowAction row={row.original} />
          </div>
        ),
      },
      {
        id: 'itemIdentity',
        header: 'Thông tin linh kiện',
        size: 300,
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
        id: 'voucherRefs',
        header: 'Tham chiếu phiếu',
        size: 280,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'hinhThuc', label: 'Hình thức' },
            { id: 'soPhieuCap', label: 'Số phiếu cấp' },
            { id: 'soPhieuSC', label: 'Số phiếu sửa chữa' },
            { id: 'soPhieuHang', label: 'Số phiếu hãng' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Hình thức</span>
            <TableDescription
              className="text-blue-600"
              value={row.original.hinhThuc}
            />
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
        id: 'assignment',
        header: 'Phân công',
        size: 160,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'kyThuat', label: 'Kỹ thuật' },
            { id: 'sl', label: 'Số lượng' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Kỹ thuật</span>
            <TableDescription value={row.original.kyThuat} />
            <span className={metaLabelClass}>Số lượng</span>
            {protectedValue(row.original.sl, true)}
          </TableMetaStack>
        ),
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
      {
        id: 'approved',
        header: 'Duyệt phiếu',
        size: 180,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ngayDuyet', label: 'Ngày duyệt' },
            { id: 'nguoiDuyet', label: 'Người duyệt' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Ngày</span>
            {protectedValue(
              row.original.ngayDuyet ? formatDate(row.original.ngayDuyet) : '—',
              true,
            )}
            <span className={metaLabelClass}>Người duyệt</span>
            <TableDescription value={row.original.nguoiDuyet || '—'} />
          </TableMetaStack>
        ),
      },
      sortOnlyColumn('tinhTrang', 'Tình trạng'),
      sortOnlyColumn('hinhThuc', 'Hình thức'),
      sortOnlyColumn('maHang', 'Mã hàng'),
      sortOnlyColumn('tenHang', 'Tên hàng'),
      sortOnlyColumn('model', 'Model'),
      sortOnlyColumn('serial', 'Serial'),
      sortOnlyColumn('nsx', 'Nhà sản xuất'),
      sortOnlyColumn('kyThuat', 'Kỹ thuật'),
      sortOnlyColumn('sl', 'Số lượng'),
      sortOnlyColumn('soPhieuCap', 'Số phiếu cấp'),
      sortOnlyColumn('soPhieuSC', 'Số phiếu sửa chữa'),
      sortOnlyColumn('soPhieuHang', 'Số phiếu hãng'),
      sortOnlyColumn('ngayTao', 'Ngày tạo'),
      sortOnlyColumn('nguoiTao', 'Người tạo'),
      sortOnlyColumn('ngayDuyet', 'Ngày duyệt'),
      sortOnlyColumn('nguoiDuyet', 'Người duyệt'),
    ],
    [],
  )
}

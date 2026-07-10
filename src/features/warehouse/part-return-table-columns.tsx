/**
 * DSTraLK (Danh sách trả linh kiện) — verified 18-column reference set, plus
 * a leading "##" ordinal column and the row-level Duyệt action.
 */
import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
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
import { buildSelectionColumn, notify } from '@/components/shared'
import { formatDate } from '@/lib/format'
import { duyetTraLK } from '@/domains/warehouse/mock-mutations'
import type { PartReturn } from '@/domains/warehouse/types'

export const PART_RETURN_TABLE_ID = 'part-return-list'

function DuyetRowAction({ row }: { row: PartReturn }) {
  const qc = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => duyetTraLK([row.id]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['part-return-list'] })
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
        className="h-7 text-xs"
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
            <AlertDialogAction onClick={() => mutation.mutate()}>Đã nhận</AlertDialogAction>
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
        id: 'stt',
        header: '##',
        enableSorting: false,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.index + 1}</span>,
      },
      buildSelectionColumn<PartReturn>(),
      {
        id: 'tinhTrang',
        header: 'Tình trạng',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span
              className={
                row.original.tinhTrang === 'Đã duyệt'
                  ? 'text-emerald-600 font-medium'
                  : 'text-amber-600 font-medium'
              }
            >
              {row.original.tinhTrang}
            </span>
            <DuyetRowAction row={row.original} />
          </div>
        ),
      },
      {
        id: 'hinhThuc',
        accessorKey: 'hinhThuc',
        header: 'Hình thức',
        cell: ({ row }) => <span className="text-blue-600">{row.original.hinhThuc}</span>,
      },
      { id: 'maHang', accessorKey: 'maHang', header: 'Mã hàng' },
      { id: 'tenHang', accessorKey: 'tenHang', header: 'Tên hàng' },
      { id: 'kyThuat', accessorKey: 'kyThuat', header: 'Kĩ thuật' },
      { id: 'sl', accessorKey: 'sl', header: 'SL' },
      { id: 'soPhieuCap', accessorKey: 'soPhieuCap', header: 'Số phiếu cấp' },
      { id: 'soPhieuSC', accessorKey: 'soPhieuSC', header: 'Số phiếu SC' },
      { id: 'soPhieuHang', accessorKey: 'soPhieuHang', header: 'Số phiếu hãng' },
      { id: 'model', accessorKey: 'model', header: 'Model' },
      { id: 'serial', accessorKey: 'serial', header: 'Serial' },
      { id: 'nsx', accessorKey: 'nsx', header: 'NSX' },
      {
        id: 'ngayTao',
        accessorKey: 'ngayTao',
        header: 'Ngày tạo',
        cell: ({ row }) => formatDate(row.original.ngayTao),
      },
      { id: 'nguoiTao', accessorKey: 'nguoiTao', header: 'Người tạo' },
      {
        id: 'ngayDuyet',
        accessorKey: 'ngayDuyet',
        header: 'Ngày duyệt',
        cell: ({ row }) => (row.original.ngayDuyet ? formatDate(row.original.ngayDuyet) : '—'),
      },
      {
        id: 'nguoiDuyet',
        accessorKey: 'nguoiDuyet',
        header: 'Người duyệt',
        cell: ({ row }) => row.original.nguoiDuyet || '—',
      },
    ],
    [],
  )
}

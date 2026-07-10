/**
 * DSTraLK batch toolbar — bulk Duyệt (Chờ duyệt → Đã duyệt) with the exact
 * reference confirm text, In Phiếu Trả (empty-selection alert), Xuất ra Excel.
 */
import { useState } from 'react'
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
import { notify } from '@/components/shared'
import { exportToXlsx } from '@/lib/export-xlsx'
import { duyetTraLK } from '@/domains/warehouse/mock-mutations'
import type { PartReturn } from '@/domains/warehouse/types'
import { printPhieuTraKT } from './prints/warehouse-prints'

interface PartReturnBatchToolbarProps {
  selected: PartReturn[]
  /** Full filtered row set (ignoring pagination/selection) for Xuất ra Excel. */
  allRows: PartReturn[]
  onReload: () => void
}

const EXPORT_COLUMNS = [
  { header: 'Tình trạng', accessor: (r: PartReturn) => r.tinhTrang },
  { header: 'Hình thức', accessor: (r: PartReturn) => r.hinhThuc },
  { header: 'Mã hàng', accessor: (r: PartReturn) => r.maHang },
  { header: 'Tên hàng', accessor: (r: PartReturn) => r.tenHang },
  { header: 'Kĩ thuật', accessor: (r: PartReturn) => r.kyThuat },
  { header: 'SL', accessor: (r: PartReturn) => r.sl },
  { header: 'Số phiếu cấp', accessor: (r: PartReturn) => r.soPhieuCap },
  { header: 'Số phiếu SC', accessor: (r: PartReturn) => r.soPhieuSC },
  { header: 'Số phiếu hãng', accessor: (r: PartReturn) => r.soPhieuHang },
  { header: 'Model', accessor: (r: PartReturn) => r.model },
  { header: 'Serial', accessor: (r: PartReturn) => r.serial },
  { header: 'NSX', accessor: (r: PartReturn) => r.nsx },
  { header: 'Ngày tạo', accessor: (r: PartReturn) => r.ngayTao },
  { header: 'Người tạo', accessor: (r: PartReturn) => r.nguoiTao },
  { header: 'Ngày duyệt', accessor: (r: PartReturn) => r.ngayDuyet },
  { header: 'Người duyệt', accessor: (r: PartReturn) => r.nguoiDuyet },
]

export function PartReturnBatchToolbar({
  selected,
  allRows,
  onReload,
}: PartReturnBatchToolbarProps) {
  const qc = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const ids = selected.map((r) => r.id)

  const mutation = useMutation({
    mutationFn: async () => duyetTraLK(ids),
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ['part-return-list'] })
      notify.success('Duyệt thành công!')
      setConfirmOpen(false)
      void n
    },
  })

  function requireSelection(action: string): boolean {
    if (ids.length === 0) {
      notify.error(`Vui lòng chọn phiếu để ${action}`)
      return false
    }
    return true
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() => requireSelection('duyệt') && setConfirmOpen(true)}
      >
        Duyệt
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() => requireSelection('in') && void printPhieuTraKT(selected)}
      >
        In Phiếu Trả
      </Button>
      <Button size="sm" variant="ghost" className="h-8" onClick={onReload}>
        Tải lại trang
      </Button>

      <div className="flex-1" />

      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          void exportToXlsx({
            filename: 'ds-tra-lk',
            sheetName: 'Trả linh kiện',
            columns: EXPORT_COLUMNS,
            rows: allRows,
          })
        }
      >
        Xuất ra Excel
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
    </div>
  )
}

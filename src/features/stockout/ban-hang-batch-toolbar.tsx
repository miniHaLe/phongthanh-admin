/**
 * Bán Hàng bulk toolbar — refresh (Tải lại trang) + Chỉnh sửa (single-selection
 * → edit route) + Xóa (confirm delete) over checked rows.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
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
import { ROUTES } from '@/constants/routes'
import type { SellingOrder } from '@/domains/warehouse/types'

interface BanHangBatchToolbarProps {
  selected: SellingOrder[]
  onReload: () => void
  onDelete: (ids: string[]) => void
}

export function BanHangBatchToolbar({
  selected,
  onReload,
  onDelete,
}: BanHangBatchToolbarProps) {
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ids = selected.map((r) => r.id)

  function requireSelection(action: string): boolean {
    if (ids.length === 0) {
      notify.error(`Vui lòng chọn phiếu để ${action}`)
      return false
    }
    return true
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" className="h-8" onClick={onReload}>
        Tải lại trang
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() => {
          if (!requireSelection('chỉnh sửa')) return
          navigate(ROUTES.stockOutSalesEdit(ids[0]))
        }}
      >
        Chỉnh sửa
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-8 gap-1"
        onClick={() => requireSelection('xóa') && setConfirmDelete(true)}
      >
        <Trash2 className="size-4" /> Xóa
      </Button>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn xóa các phiếu bán hàng đã chọn?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(ids)
                notify.success(`Đã xóa ${ids.length} phiếu`)
                setConfirmDelete(false)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * "Thu xác LK" confirm modal — marks an issued-part usage row's carcass as
 * recovered (tinhTrang → Đã trả xác LK) via thuXacLK. Simple confirm dialog,
 * no extra fields collected (mirrors the reference's lightweight popup).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { thuXacLK } from '@/domains/warehouse/mock-mutations'

interface ThuXacModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
}

export function ThuXacModal({ open, onOpenChange, id }: ThuXacModalProps) {
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => thuXacLK(id),
    onSuccess: (ok) => {
      if (ok) {
        qc.invalidateQueries({ queryKey: ['issued-usage-list'] })
        notify.success('Đã thu xác linh kiện')
      } else {
        notify.error('Không tìm thấy phiếu')
      }
      onOpenChange(false)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Thu xác linh kiện</AlertDialogTitle>
          <AlertDialogDescription>
            Xác nhận đã thu hồi xác linh kiện đã cấp cho phiếu này?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Không</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

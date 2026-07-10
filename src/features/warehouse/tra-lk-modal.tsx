/**
 * "Trả Linh kiện" confirm modal — marks an issued-part usage row as returned
 * (tinhTrang → Có trả LK, slTra += 1) via traLK.
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
import { traLK } from '@/domains/warehouse/mock-mutations'

interface TraLkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
}

export function TraLkModal({ open, onOpenChange, id }: TraLkModalProps) {
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => traLK(id),
    onSuccess: (ok) => {
      if (ok) {
        qc.invalidateQueries({ queryKey: ['issued-usage-list'] })
        notify.success('Đã trả linh kiện')
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
          <AlertDialogTitle>Trả Linh kiện</AlertDialogTitle>
          <AlertDialogDescription>
            Xác nhận trả lại linh kiện đã cấp cho phiếu này?
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

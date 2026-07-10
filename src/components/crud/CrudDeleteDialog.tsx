/**
 * Confirm-delete alert dialog for any CRUD entity.
 * Shows entity name/code in the body for clarity.
 */
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

interface CrudDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  entityLabel: string
  isPending?: boolean
}

export function CrudDeleteDialog({
  open,
  onClose,
  onConfirm,
  entityLabel,
  isPending,
}: CrudDeleteDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa <strong>{entityLabel}</strong>? Hành động này
            không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={onClose}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Đang xóa…' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

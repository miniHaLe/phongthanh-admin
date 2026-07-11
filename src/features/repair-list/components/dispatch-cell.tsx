/**
 * Kỹ thuật cell — dispatch workflow. Unassigned → "Điều phối" button; assigned →
 * tech name (blue bold) + "Đổi kỹ thuật" + "Hủy điều phối" (confirm dialog).
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
import { TableDescription } from '@/components/shared/data-table/table-cell-content'
import { cancelDispatch } from '@/domains/repair/mock-mutations'
import type { RepairTicket } from '@/domains/repair/types'
import { DispatchTechnicianModal } from './dispatch-technician-modal'

export function DispatchCell({ ticket }: { ticket: RepairTicket }) {
  const qc = useQueryClient()
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const cancelMutation = useMutation({
    mutationFn: async () => {
      cancelDispatch(ticket.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
      notify.success('Đã hủy điều phối')
    },
  })

  if (!ticket.kyThuatId) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className="h-11 whitespace-nowrap xl:h-7"
          onClick={() => setDispatchOpen(true)}
        >
          Điều phối
        </Button>
        {dispatchOpen && (
          <DispatchTechnicianModal
            open={dispatchOpen}
            onOpenChange={setDispatchOpen}
            ids={[ticket.id]}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex min-w-0 flex-col items-start gap-0.5">
      <TableDescription
        value={ticket.kyThuat}
        className="font-bold leading-tight text-blue-600"
      />
      <div className="flex flex-col items-start gap-0.5">
        <button
          type="button"
          className="min-h-11 whitespace-nowrap text-xs text-primary hover:underline xl:min-h-0"
          onClick={() => setDispatchOpen(true)}
        >
          Đổi kỹ thuật
        </button>
        <button
          type="button"
          className="min-h-11 whitespace-nowrap text-xs text-destructive hover:underline xl:min-h-0"
          onClick={() => setConfirmCancel(true)}
        >
          Hủy điều phối
        </button>
      </div>

      {dispatchOpen && (
        <DispatchTechnicianModal
          open={dispatchOpen}
          onOpenChange={setDispatchOpen}
          ids={[ticket.id]}
        />
      )}

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn hủy điều phối?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelMutation.mutate()}>
              Đồng ý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

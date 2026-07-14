import { useState, type ComponentProps } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { notify } from '@/components/shared'
import { DirtyCloseConfirmDialog } from '@/components/shared/dirty-close-confirm-dialog'
import { useDirtyCloseConfirm } from '@/hooks/use-dirty-close-confirm'
import type { KhachHang } from '@/types/masterdata-types'
import type { persistCustomer } from './create-customer'
import { CustomerForm } from './customer-form'
import { useCustomerReferenceData } from './use-customer-reference-data'

type CustomerFormOverrides = Pick<
  ComponentProps<typeof CustomerForm>,
  | 'initialCustomerTypeId'
  | 'customerTypeOptions'
  | 'nameLabel'
  | 'submitLabel'
>

interface CustomerFormDialogProps {
  open: boolean
  title: string
  idPrefix: string
  customer?: KhachHang
  formOverrides?: CustomerFormOverrides
  successMessage: string
  errorMessage: string
  onClose: () => void
  onSaved: (customer: KhachHang) => void
  saveCustomer: (
    data: Parameters<typeof persistCustomer>[0],
  ) => Promise<KhachHang>
}

export function CustomerFormDialog({
  open,
  title,
  idPrefix,
  customer,
  formOverrides,
  successMessage,
  errorMessage,
  onClose,
  onSaved,
  saveCustomer,
}: CustomerFormDialogProps) {
  const references = useCustomerReferenceData(open)
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  function closeDialog() {
    setIsDirty(false)
    onClose()
  }

  const closeGuard = useDirtyCloseConfirm({
    isDirty,
    isPending,
    onClose: closeDialog,
  })

  async function save(data: Parameters<typeof persistCustomer>[0]) {
    setIsPending(true)
    try {
      const saved = await saveCustomer(data)
      await queryClient.invalidateQueries({ queryKey: ['khach-hang'] })
      notify.success(successMessage)
      onSaved(saved)
      closeGuard.closeImmediately()
    } catch (error) {
      notify.error(error instanceof Error ? error.message : errorMessage)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => !next && closeGuard.requestClose()}
      >
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          {references.loading ? (
            <p
              role="status"
              className="py-8 text-center text-sm text-muted-foreground"
            >
              Đang tải danh mục địa chỉ và ngân hàng…
            </p>
          ) : references.error || !references.geography ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {references.error ?? 'Không thể tải danh mục địa chỉ.'}
            </p>
          ) : (
            <CustomerForm
              idPrefix={idPrefix}
              initialCustomer={customer}
              {...formOverrides}
              provinces={references.geography.provinces}
              communes={references.geography.communes}
              banks={references.banks}
              isPending={isPending}
              onCancel={closeGuard.requestClose}
              onDirtyChange={setIsDirty}
              onSubmit={save}
            />
          )}
        </DialogContent>
      </Dialog>
      <DirtyCloseConfirmDialog
        open={closeGuard.confirmOpen}
        onOpenChange={closeGuard.handleConfirmOpenChange}
        onConfirm={closeGuard.confirmDiscard}
      />
    </>
  )
}

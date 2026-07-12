import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { notify } from '@/components/shared'
import type { KhachHang } from '@/types/masterdata-types'
import { persistCustomer, updateCustomer } from './create-customer'
import { CustomerForm } from './customer-form'
import { useCustomerReferenceData } from './use-customer-reference-data'

interface CustomerEditorDialogProps {
  open: boolean
  customer?: KhachHang
  onClose: () => void
  onSaved: (customer: KhachHang) => void
}

export function CustomerEditorDialog({
  open,
  customer,
  onClose,
  onSaved,
}: CustomerEditorDialogProps) {
  const references = useCustomerReferenceData()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  async function save(data: Parameters<typeof persistCustomer>[0]) {
    setIsPending(true)
    try {
      const saved = customer
        ? await updateCustomer(customer.id, data)
        : await persistCustomer(data)
      await queryClient.invalidateQueries({ queryKey: ['khach-hang'] })
      notify.success(customer ? 'Đã cập nhật khách hàng' : 'Đã thêm khách hàng')
      onSaved(saved)
      onClose()
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể lưu khách hàng',
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !isPending && onClose()}
    >
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Chỉnh sửa Khách Hàng' : 'Thêm Khách Hàng'}
          </DialogTitle>
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
            idPrefix={
              customer ? `edit-customer-${customer.id}` : 'create-customer'
            }
            initialCustomer={customer}
            provinces={references.geography.provinces}
            communes={references.geography.communes}
            banks={references.banks}
            isPending={isPending}
            onCancel={onClose}
            onSubmit={save}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

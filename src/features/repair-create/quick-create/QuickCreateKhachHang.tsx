import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { notify, type AutocompleteOption } from '@/components/shared'
import { CustomerForm } from '@/features/customer/customer-form'
import { persistCustomer } from '@/features/customer/create-customer'
import { useCustomerReferenceData } from '@/features/customer/use-customer-reference-data'

export interface CreatedKhachHang extends AutocompleteOption {
  ten: string
  sdt: string
  diaChi: string
}

interface QuickCreateKhachHangProps {
  close: () => void
  select: (opt: CreatedKhachHang) => void
}

export function QuickCreateKhachHang({
  close,
  select,
}: QuickCreateKhachHangProps) {
  const references = useCustomerReferenceData()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  async function handleSave(data: Parameters<typeof persistCustomer>[0]) {
    setIsPending(true)
    try {
      const customer = await persistCustomer(data)
      await queryClient.invalidateQueries({ queryKey: ['khach-hang'] })
      notify.success('Đã thêm khách hàng')
      select({
        id: customer.id,
        label: customer.tenKH,
        ten: customer.tenKH,
        sdt: customer.dienThoai,
        diaChi: customer.diaChi ?? '',
      })
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm khách hàng',
      )
    } finally {
      setIsPending(false)
    }
  }

  if (references.loading) {
    return (
      <p
        role="status"
        className="py-8 text-center text-sm text-muted-foreground"
      >
        Đang tải danh mục…
      </p>
    )
  }

  if (references.error || !references.geography) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
      >
        {references.error ?? 'Không thể tải danh mục địa chỉ.'}
      </p>
    )
  }

  return (
    <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto overflow-x-hidden pr-1">
      <CustomerForm
        idPrefix="quick-create-customer"
        provinces={references.geography.provinces}
        communes={references.geography.communes}
        banks={references.banks}
        isPending={isPending}
        onCancel={close}
        onSubmit={handleSave}
      />
    </div>
  )
}

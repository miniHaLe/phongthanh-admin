import type { KhachHang } from '@/types/masterdata-types'
import { persistCustomer, updateCustomer } from './create-customer'
import { CustomerFormDialog } from './customer-form-dialog'

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
  return (
    <CustomerFormDialog
      open={open}
      title={customer ? 'Chỉnh sửa Khách Hàng' : 'Thêm Khách Hàng'}
      idPrefix={
        customer ? `edit-customer-${customer.id}` : 'create-customer'
      }
      customer={customer}
      successMessage={
        customer ? 'Đã cập nhật khách hàng' : 'Đã thêm khách hàng'
      }
      errorMessage="Không thể lưu khách hàng"
      onClose={onClose}
      onSaved={onSaved}
      saveCustomer={(data) =>
        customer ? updateCustomer(customer.id, data) : persistCustomer(data)
      }
    />
  )
}

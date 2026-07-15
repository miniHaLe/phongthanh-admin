import { LOAI_KHACH_HANG } from '@/mock/seed/nhom-khach-hang'
import { persistCustomer } from './create-customer'
import { CustomerFormDialog } from './customer-form-dialog'

const DEALER_TYPE_NAMES = [
  'Đại lý chính',
  'Đại lý/Cửa hàng',
  'Trung tâm bảo hành',
]
const DEALER_TYPE_OPTIONS = LOAI_KHACH_HANG.filter((item) =>
  DEALER_TYPE_NAMES.includes(item.ten),
)

interface ThemDaiLyModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function ThemDaiLyModal({
  open,
  onClose,
  onCreated,
}: ThemDaiLyModalProps) {
  return (
    <CustomerFormDialog
      open={open}
      title="Thêm Đại Lý"
      idPrefix="create-dealer"
      formOverrides={{
        initialCustomerTypeId: DEALER_TYPE_OPTIONS[0]?.id,
        customerTypeOptions: DEALER_TYPE_OPTIONS,
        nameLabel: 'Tên đại lý',
      }}
      successMessage="Đã thêm đại lý"
      errorMessage="Không thể thêm đại lý"
      onClose={onClose}
      onSaved={onCreated}
      saveCustomer={persistCustomer}
    />
  )
}

import type { KhachHang } from '@/types/masterdata-types'
import { CustomerEditorDialog } from './customer-editor-dialog'

interface ThemKhachHangModalProps {
  open: boolean
  onClose: () => void
  onCreated: (customer?: KhachHang) => void
}

export function ThemKhachHangModal({
  open,
  onClose,
  onCreated,
}: ThemKhachHangModalProps) {
  return (
    <CustomerEditorDialog open={open} onClose={onClose} onSaved={onCreated} />
  )
}

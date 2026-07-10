import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export { toast }

export function ToastProvider() {
  return <Toaster richColors position="bottom-right" />
}

/** Vietnamese-defaulted toast helpers */
export const notify = {
  success(msg?: string) {
    toast.success(msg ?? 'Thao tác thành công')
  },
  error(msg?: string) {
    toast.error(msg ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
  },
  info(msg?: string) {
    toast.info(msg ?? 'Thông báo')
  },
  warning(msg?: string) {
    toast.warning(msg ?? 'Cảnh báo')
  },
  loading(msg?: string) {
    return toast.loading(msg ?? 'Đang xử lý…')
  },
}

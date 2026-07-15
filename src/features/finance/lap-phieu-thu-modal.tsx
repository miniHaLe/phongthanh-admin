import { LOAI_THU_OPTIONS } from '@/config/finance-tables/thu-chi.config'
import { createPhieuThu } from '@/mock/finance-mock'
import {
  LapPhieuModal,
  type LapPhieuModalConfig,
  type LapPhieuModalProps,
} from './lap-phieu-modal'

const CONFIG: LapPhieuModalConfig = {
  idPrefix: 'lpt',
  title: 'Lập Phiếu Thu',
  voucherLabel: 'thu',
  typeLabel: 'Loại thu',
  typePlaceholder: 'Chọn loại thu',
  typeOptions: LOAI_THU_OPTIONS,
  customerInputId: 'lpt-khachhang',
  customerLabel: 'Tên khách hàng',
  createVoucher: createPhieuThu,
}

export function LapPhieuThuModal(props: LapPhieuModalProps) {
  return <LapPhieuModal {...props} config={CONFIG} />
}

import { LOAI_CHI_OPTIONS } from '@/config/finance-tables/thu-chi.config'
import { createPhieuChi } from '@/mock/finance-mock'
import {
  LapPhieuModal,
  type LapPhieuModalConfig,
  type LapPhieuModalProps,
} from './lap-phieu-modal'

const CONFIG: LapPhieuModalConfig = {
  idPrefix: 'lpc',
  title: 'Lập Phiếu Chi',
  voucherLabel: 'chi',
  typeLabel: 'Loại chi',
  typePlaceholder: 'Chọn loại chi',
  typeOptions: LOAI_CHI_OPTIONS,
  customerInputId: 'lpc-doituong',
  customerLabel: 'Tên đối tượng chi',
  createVoucher: createPhieuChi,
}

export function LapPhieuChiModal(props: LapPhieuModalProps) {
  return <LapPhieuModal {...props} config={CONFIG} />
}

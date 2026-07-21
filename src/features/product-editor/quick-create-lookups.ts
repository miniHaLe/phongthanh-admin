/** Real-or-mock quick-create helpers for product editor lookup addons. */
import { nhaSanXuatConfig } from '@/config/crud-configs/nha-san-xuat.config'
import type { NhaSanXuat } from '@/types/masterdata-types'

/** Fields the NSX quick-create dialog can persist (Tên required; the rest optional). */
export interface QuickCreateNhaSanXuatInput {
  tenNSX: string
  maNSX?: string
  ghiChu?: string
  duongDanHang?: string
}

export function quickCreateNhaSanXuat(
  input: QuickCreateNhaSanXuatInput,
): Promise<NhaSanXuat> {
  return nhaSanXuatConfig.mockApi.create({
    tenNSX: input.tenNSX,
    maNSX: input.maNSX,
    ghiChu: input.ghiChu,
    duongDanHang: input.duongDanHang,
    active: true,
  })
}

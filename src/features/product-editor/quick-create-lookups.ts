/** Real-or-mock quick-create helpers for product editor lookup addons. */
import { modelConfig } from '@/config/crud-configs/model.config'
import { nhaSanXuatConfig } from '@/config/crud-configs/nha-san-xuat.config'
import { CURRENT_USER } from '@/mock/current-user-mock'
import type { NhaSanXuat, Model } from '@/types/masterdata-types'

export function quickCreateNhaSanXuat(ten: string): Promise<NhaSanXuat> {
  return nhaSanXuatConfig.mockApi.create({
    tenNSX: ten,
    active: true,
  })
}

export function quickCreateModel(
  ten: string,
  nhaSanXuatId: string,
  sanPhamId: string,
): Promise<Model> {
  return modelConfig.mockApi.create({
    tenModel: ten,
    nhaSanXuatId,
    sanPhamId,
    nguoiTao: CURRENT_USER.hoVaTen,
    active: true,
  })
}

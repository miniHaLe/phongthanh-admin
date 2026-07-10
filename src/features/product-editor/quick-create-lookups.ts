/**
 * Quick-create helpers for the product editor's Nhà sản xuất / Model [+]
 * addons. Push directly into the live catalog masterdata arrays (C6/C1) so
 * the new record is immediately selectable here and visible on the
 * Nhà Sản Xuất / Model catalog list pages. Module-memory only.
 */
import { NHA_SAN_XUAT_ROWS } from '@/mock/masterdata/nha-san-xuat.mock'
import { MODEL_ROWS } from '@/mock/masterdata/model.mock'
import { SAN_PHAM_ROWS } from '@/mock/masterdata/san-pham.mock'
import type { NhaSanXuat, Model } from '@/types/masterdata-types'

let nsxSeq = NHA_SAN_XUAT_ROWS.length
let modelSeq = MODEL_ROWS.length

export function quickCreateNhaSanXuat(ten: string): NhaSanXuat {
  nsxSeq += 1
  const row: NhaSanXuat = {
    id: `nsx-new-${nsxSeq}`,
    tenNSX: ten,
    active: true,
    createdAt: new Date().toISOString(),
  }
  NHA_SAN_XUAT_ROWS.unshift(row)
  return row
}

export function quickCreateModel(ten: string, nhaSanXuatId: string): Model {
  modelSeq += 1
  const row: Model = {
    id: `mod-new-${modelSeq}`,
    tenModel: ten,
    nhaSanXuatId: nhaSanXuatId || (NHA_SAN_XUAT_ROWS[0]?.id ?? ''),
    sanPhamId: SAN_PHAM_ROWS[0]?.id ?? '',
    nguoiTao: 'Hệ thống',
    active: true,
    createdAt: new Date().toISOString(),
  }
  MODEL_ROWS.unshift(row)
  return row
}

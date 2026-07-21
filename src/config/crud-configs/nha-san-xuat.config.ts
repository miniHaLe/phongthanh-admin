import { z } from 'zod'
import type { CrudConfig } from '@/types/crud-types'
import type { NhaSanXuat } from '@/types/masterdata-types'
import { NHA_SAN_XUAT_ROWS } from '@/mock/masterdata/nha-san-xuat.mock'
import { apiFor } from '@/api/api-for'
import { normalizeBrandUrl } from '@/features/model/brand-url'
import { renderBrandLinkCell } from './nha-san-xuat-link-cell'

/** Đường dẫn hãng — optional; when present must be a safe http(s) URL. Shares
 * the exact validator the quick-create dialogs use so the two entry points
 * can't diverge (z.url() alone would accept javascript:/data: schemes). */
const brandUrlSchema = z
  .string()
  .optional()
  .refine((value) => normalizeBrandUrl(value ?? '').ok, 'Đường dẫn không hợp lệ')

export const nhaSanXuatConfig: CrudConfig<NhaSanXuat> = {
  resourceKey: 'nha-san-xuat',
  title: 'Nhà Sản Xuất',
  pageSize: 20,
  defaultSort: { key: 'tenNSX', dir: 'asc' },
  mockApi: apiFor('nha-san-xuat', NHA_SAN_XUAT_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'maNSX', header: 'Mã nhà sản xuất', sortable: true, width: 130 },
    { key: 'tenNSX', header: 'Tên nhà sản xuất', sortable: true, width: 200 },
    { key: 'ghiChu', header: 'Ghi chú', width: 200 },
    {
      key: 'duongDanHang',
      header: 'Đường dẫn hãng',
      width: 200,
      renderCell: (value) => renderBrandLinkCell(value as string | undefined),
    },
  ],
  fields: [
    { key: 'maNSX', label: 'Mã nhà sản xuất', type: 'text' },
    { key: 'tenNSX', label: 'Tên nhà sản xuất', type: 'text', required: true },
    { key: 'ghiChu', label: 'Ghi chú', type: 'textarea', span: 2 },
    {
      key: 'duongDanHang',
      label: 'Đường dẫn hãng',
      type: 'text',
      span: 2,
      zodSchema: brandUrlSchema,
    },
  ],
  filters: [{ key: 'tenNSX', label: 'Tên nhà sản xuất', type: 'text' }],
}

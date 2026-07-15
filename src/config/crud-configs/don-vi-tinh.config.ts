import type { CrudConfig } from '@/types/crud-types'
import type { DonViTinh } from '@/types/masterdata-types'
import { DON_VI_TINH_ROWS } from '@/mock/masterdata/don-vi-tinh.mock'
import { apiFor } from '@/api/api-for'

export const donViTinhConfig: CrudConfig<DonViTinh> = {
  resourceKey: 'don-vi-tinh',
  title: 'Đơn Vị Tính',
  pageSize: 20,
  mockApi: apiFor('don-vi-tinh', DON_VI_TINH_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tenDVT', header: 'Tên Đơn Vị Tính', sortable: true, width: 220 },
  ],
  fields: [
    { key: 'tenDVT', label: 'Tên đơn vị tính', type: 'text', required: true },
  ],
  filters: [{ key: 'tenDVT', label: 'Tên đơn vị tính', type: 'text' }],
}

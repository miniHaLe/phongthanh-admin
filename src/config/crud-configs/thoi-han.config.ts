import type { CrudConfig } from '@/types/crud-types'
import type { ThoiHan } from '@/types/masterdata-types'
import { THOI_HAN_ROWS } from '@/mock/masterdata/thoi-han.mock'
import { apiFor } from '@/api/api-for'

export const thoiHanConfig: CrudConfig<ThoiHan> = {
  resourceKey: 'thoi-han',
  title: 'Thời Gian Bảo Hành',
  pageSize: 20,
  mockApi: apiFor('thoi-han', THOI_HAN_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'ten', header: 'Tên', sortable: true, width: 180 },
    { key: 'loai', header: 'Loại', width: 100 },
    { key: 'thoiGian', header: 'Thời Gian Bảo Hành', sortable: true, width: 160 },
  ],
  fields: [
    { key: 'ten', label: 'Tên', type: 'text', required: true },
    {
      key: 'loai',
      label: 'Loại Thời Gian',
      type: 'radio',
      required: true,
      options: [
        { label: 'Tháng', value: 'Tháng' },
        { label: 'Năm', value: 'Năm' },
      ],
    },
    { key: 'thoiGian', label: 'Thời Gian', type: 'number', required: true },
  ],
  filters: [{ key: 'ten', label: 'Tên thời gian', type: 'text' }],
}

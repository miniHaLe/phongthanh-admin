import type { CrudConfig } from '@/types/crud-types'
import type { LoaiPhatThuong } from '@/domains/hr/types'
import { loaiPhatThuongApi } from '@/domains/hr/loai-phat-thuong.mock'

const LOAI_OPTIONS = [
  { label: 'Thưởng', value: 'Thưởng' },
  { label: 'Phạt', value: 'Phạt' },
]

export const loaiPhatThuongConfig: CrudConfig<LoaiPhatThuong> = {
  resourceKey: 'loai-phat-thuong',
  title: 'Loại Phạt Thưởng',
  pageSize: 20,
  mockApi: loaiPhatThuongApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'loai', header: 'Loại', width: 100 },
    { key: 'tenLoai', header: 'Tên Loại', sortable: true, width: 240 },
  ],
  fields: [
    {
      key: 'loai',
      label: 'Loại',
      type: 'radio',
      required: true,
      options: LOAI_OPTIONS,
    },
    { key: 'tenLoai', label: 'Tên Loại', type: 'text', required: true },
  ],
  filters: [{ key: 'tenLoai', label: 'Tên loại', type: 'text' }],
}

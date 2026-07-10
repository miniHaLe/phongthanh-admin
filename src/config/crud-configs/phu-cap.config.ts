import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { PhuCap } from '@/domains/hr/types'
import { phuCapApi } from '@/domains/hr/phu-cap.mock'

const LOAI_PHU_CAP_OPTIONS = [
  { label: 'Ăn Chia', value: 'Ăn Chia' },
  { label: 'Tiền mặt', value: 'Tiền mặt' },
]

export const phuCapConfig: CrudConfig<PhuCap> = {
  resourceKey: 'phu-cap',
  title: 'Phụ Cấp',
  pageSize: 20,
  mockApi: phuCapApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tenPhuCap', header: 'Tên phụ cấp', sortable: true, width: 220 },
    { key: 'loaiPhuCap', header: 'Loại phụ cấp', width: 140 },
    {
      key: 'giaTri',
      header: 'GiaTri',
      sortable: true,
      width: 140,
      renderCell: (v) => formatVND(v as number),
    },
  ],
  fields: [
    { key: 'tenPhuCap', label: 'Tên Phụ Cấp', type: 'text', required: true },
    {
      key: 'loaiPhuCap',
      label: 'Loại',
      type: 'radio',
      required: true,
      options: LOAI_PHU_CAP_OPTIONS,
    },
    { key: 'giaTri', label: 'Giá Trị', type: 'money', required: true },
  ],
  filters: [{ key: 'tenPhuCap', label: 'Tên phụ cấp', type: 'text' }],
}

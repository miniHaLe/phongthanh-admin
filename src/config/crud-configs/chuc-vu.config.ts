import type { CrudConfig } from '@/types/crud-types'
import type { ChucVu } from '@/types/masterdata-types'
import { chucVuApi } from '@/mock/masterdata/chuc-vu.mock'

export const chucVuConfig: CrudConfig<ChucVu> = {
  resourceKey: 'chuc-vu',
  title: 'Chức Vụ',
  pageSize: 20,
  mockApi: chucVuApi,
  bulkDelete: true,
  columns: [
    { key: 'maChucVu', header: 'Mã Chức Vụ', sortable: true, width: 120 },
    { key: 'tenChucVu', header: 'Tên Chức Vụ', sortable: true, width: 200 },
  ],
  fields: [
    { key: 'maChucVu', label: 'Mã Chức Vụ', type: 'text', required: true },
    { key: 'tenChucVu', label: 'Tên Chức Vụ', type: 'text', required: true },
  ],
  // Search matches name OR code (reference: "Tên chức vụ hoặc mã").
  filters: [
    { key: 'tenChucVu', label: 'Tên chức vụ hoặc mã', type: 'text' },
  ],
}

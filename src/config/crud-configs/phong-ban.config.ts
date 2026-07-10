import type { CrudConfig } from '@/types/crud-types'
import type { PhongBan } from '@/types/masterdata-types'
import { phongBanApi } from '@/mock/masterdata/phong-ban.mock'

export const phongBanConfig: CrudConfig<PhongBan> = {
  resourceKey: 'phong-ban',
  title: 'Phòng Ban',
  pageSize: 20,
  mockApi: phongBanApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'maPhongBan', header: 'Mã Phòng Ban', sortable: true, width: 130 },
    { key: 'tenPhongBan', header: 'Tên Phòng Ban', sortable: true, width: 220 },
  ],
  fields: [
    { key: 'maPhongBan', label: 'Mã Phòng Ban', type: 'text', required: true },
    {
      key: 'tenPhongBan',
      label: 'Tên Phòng Ban',
      type: 'text',
      required: true,
    },
  ],
  filters: [{ key: 'tenPhongBan', label: 'Tên phòng ban', type: 'text' }],
}

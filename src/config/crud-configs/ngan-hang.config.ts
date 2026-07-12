import type { CrudConfig } from '@/types/crud-types'
import type { NganHang } from '@/domains/hr/types'
import { NGAN_HANG_ROWS } from '@/domains/hr/ngan-hang.mock'
import { apiFor } from '@/api/api-for'

export const nganHangConfig: CrudConfig<NganHang> = {
  resourceKey: 'ngan-hang',
  title: 'Ngân Hàng',
  pageSize: 20,
  mockApi: apiFor('ngan-hang', NGAN_HANG_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'maNganHang', header: 'Mã Ngân Hàng', sortable: true, width: 130 },
    { key: 'tenNganHang', header: 'Tên Ngân Hàng', sortable: true, width: 220 },
    { key: 'diaChi', header: 'Địa chỉ', width: 260 },
  ],
  fields: [
    {
      key: 'maNganHang',
      label: 'Mã Ngân Hàng',
      type: 'text',
      required: true,
    },
    {
      key: 'tenNganHang',
      label: 'Tên Ngân Hàng',
      type: 'text',
      required: true,
    },
    { key: 'diaChi', label: 'Địa chỉ', type: 'textarea', span: 2 },
  ],
  filters: [{ key: 'tenNganHang', label: 'Tên ngân hàng', type: 'text' }],
}

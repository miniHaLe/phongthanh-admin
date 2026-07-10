import type { CrudConfig } from '@/types/crud-types'
import type { ChiNhanh } from '@/types/masterdata-types'
import { chiNhanhApi } from '@/mock/masterdata/chi-nhanh.mock'

const yesNo = (v: unknown) => (v ? '✓' : '—')

export const chiNhanhConfig: CrudConfig<ChiNhanh> = {
  resourceKey: 'chi-nhanh',
  title: 'Chi Nhánh',
  pageSize: 20,
  mockApi: chiNhanhApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tenChiNhanh', header: 'Chi nhánh', sortable: true, width: 220 },
    { key: 'soDienThoai', header: 'Điện thoại', width: 130 },
    { key: 'hotline', header: 'Hotline', width: 120 },
    { key: 'nguoiLienHe', header: 'Người liên hệ', width: 160 },
    { key: 'email', header: 'Email', width: 180 },
    { key: 'diaChi', header: 'Địa chỉ', width: 240 },
    { key: 'chinh', header: 'Chính', width: 80, renderCell: yesNo },
    { key: 'chuyenCn', header: 'Chuyển CN', width: 100, renderCell: yesNo },
  ],
  fields: [
    { key: 'tenChiNhanh', label: 'Tên chi nhánh', type: 'text', required: true },
    { key: 'soDienThoai', label: 'Điện thoại', type: 'phone' },
    { key: 'hotline', label: 'Hotline', type: 'text' },
    { key: 'diaChi', label: 'Địa chỉ', type: 'textarea', span: 2 },
    { key: 'nguoiLienHe', label: 'Người liên hệ', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'toaDo', label: 'Toạ độ (VD: 21.029743, 105.833882)', type: 'text', span: 2 },
    { key: 'chinh', label: 'Chi nhánh chính', type: 'switch' },
    { key: 'chuyenCn', label: 'Chuyển chi nhánh', type: 'switch' },
  ],
  filters: [{ key: 'tenChiNhanh', label: 'Tên chi nhánh', type: 'text' }],
}

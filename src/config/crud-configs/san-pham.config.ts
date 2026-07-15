import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { SanPham } from '@/types/masterdata-types'
import { SAN_PHAM_ROWS } from '@/mock/masterdata/san-pham.mock'
import { apiFor } from '@/api/api-for'
import { lookupLabel } from '@/components/crud/lookup-label'
import { loadLookupOptions } from '@/hooks/use-lookup'

const loadNhomSanPhamOptions = () =>
  loadLookupOptions('nhom-san-pham', (row) => row.tenNhomSP)

export const sanPhamConfig: CrudConfig<SanPham> = {
  resourceKey: 'san-pham',
  title: 'Sản Phẩm',
  pageSize: 20,
  defaultSort: { key: 'tenSP', dir: 'asc' },
  mockApi: apiFor('san-pham', SAN_PHAM_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tenSP', header: 'Tên sản phẩm', sortable: true, width: 220 },
    { key: 'maSP', header: 'Mã sản phẩm', sortable: true, width: 120 },
    {
      key: 'nhomSanPhamId',
      header: 'Nhóm sản phẩm',
      width: 170,
      renderCell: (v) =>
        lookupLabel('nhom-san-pham', v as string, (row) => row.tenNhomSP),
    },
    {
      key: 'tienKhoan',
      header: 'Tiền khoán',
      sortable: true,
      width: 130,
      renderCell: (v) => (v ? formatVND(v as number) : ''),
    },
  ],
  fields: [
    {
      key: 'nhomSanPhamId',
      label: 'Nhóm Sản Phẩm',
      type: 'select',
      required: true,
      loadOptions: loadNhomSanPhamOptions,
    },
    { key: 'maSP', label: 'Mã sản phẩm', type: 'text' },
    { key: 'tenSP', label: 'Tên sản phẩm', type: 'text', required: true },
    { key: 'tienKhoan', label: 'Tiền Khoán', type: 'money' },
  ],
  filters: [
    { key: 'tenSP', label: 'Tên sản phẩm', type: 'text' },
    {
      key: 'nhomSanPhamId',
      label: 'Nhóm sản phẩm',
      type: 'select',
      loadOptions: loadNhomSanPhamOptions,
    },
  ],
}

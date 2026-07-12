import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { SanPham } from '@/types/masterdata-types'
import { SAN_PHAM_ROWS } from '@/mock/masterdata/san-pham.mock'
import { NHOM_SAN_PHAM_ROWS } from '@/mock/masterdata/nhom-san-pham.mock'
import { apiFor } from '@/api/api-for'

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
        NHOM_SAN_PHAM_ROWS.find((r) => r.id === v)?.tenNhomSP ?? (v as string),
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
      options: NHOM_SAN_PHAM_ROWS.map((r) => ({
        label: r.tenNhomSP,
        value: r.id,
      })),
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
      options: NHOM_SAN_PHAM_ROWS.map((r) => ({
        label: r.tenNhomSP,
        value: r.id,
      })),
    },
  ],
}

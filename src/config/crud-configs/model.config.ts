import { formatDate } from '@/lib/format'
import { apiFor } from '@/api/api-for'
import type { CrudConfig } from '@/types/crud-types'
import type { Model } from '@/types/masterdata-types'
import { MODEL_ROWS } from '@/mock/masterdata/model.mock'
import { NHA_SAN_XUAT_ROWS } from '@/mock/masterdata/nha-san-xuat.mock'
import { SAN_PHAM_ROWS } from '@/mock/masterdata/san-pham.mock'

export const modelConfig: CrudConfig<Model> = {
  resourceKey: 'model',
  title: 'Model',
  pageSize: 20,
  defaultSort: { key: 'tenModel', dir: 'asc' },
  mockApi: apiFor('model', MODEL_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  export: true,
  columns: [
    { key: 'tenModel', header: 'Tên model', sortable: true, width: 200 },
    { key: 'maModel', header: 'Model Code', width: 110 },
    {
      key: 'nhaSanXuatId',
      header: 'Nhà sản xuất',
      width: 150,
      renderCell: (v) =>
        NHA_SAN_XUAT_ROWS.find((r) => r.id === v)?.tenNSX ?? (v as string),
    },
    {
      key: 'sanPhamId',
      header: 'Sản phẩm',
      width: 160,
      renderCell: (v) =>
        SAN_PHAM_ROWS.find((r) => r.id === v)?.tenSP ?? (v as string),
    },
    { key: 'nguoiTao', header: 'Người tạo', width: 150 },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    { key: 'ghiChu', header: 'Ghi chú', width: 200, hidden: true },
  ],
  fields: [
    {
      key: 'sanPhamId',
      label: 'Tên Sản Phẩm',
      type: 'select',
      required: true,
      options: SAN_PHAM_ROWS.map((r) => ({ label: r.tenSP, value: r.id })),
    },
    {
      key: 'nhaSanXuatId',
      label: 'Nhà sản xuất',
      type: 'select',
      required: true,
      options: NHA_SAN_XUAT_ROWS.map((r) => ({ label: r.tenNSX, value: r.id })),
    },
    { key: 'tenModel', label: 'Tên model', type: 'text', required: true },
    { key: 'ghiChu', label: 'Ghi chú', type: 'textarea', span: 2 },
  ],
  filters: [
    {
      key: 'sanPhamId',
      label: 'Sản phẩm',
      type: 'select',
      options: SAN_PHAM_ROWS.map((r) => ({ label: r.tenSP, value: r.id })),
    },
    {
      key: 'nhaSanXuatId',
      label: 'Nhà sản xuất',
      type: 'select',
      options: NHA_SAN_XUAT_ROWS.map((r) => ({ label: r.tenNSX, value: r.id })),
    },
    { key: 'tenModel', label: 'Tên model', type: 'text' },
  ],
}

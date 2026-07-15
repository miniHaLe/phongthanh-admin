import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { Model } from '@/types/masterdata-types'
import { MODEL_ROWS } from '@/mock/masterdata/model.mock'
import { apiFor } from '@/api/api-for'
import { lookupLabel } from '@/components/crud/lookup-label'
import { loadLookupOptions } from '@/hooks/use-lookup'

const loadNhaSanXuatOptions = () =>
  loadLookupOptions('nha-san-xuat', (row) => row.tenNSX)
const loadSanPhamOptions = () =>
  loadLookupOptions('san-pham', (row) => row.tenSP)

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
        lookupLabel('nha-san-xuat', v as string, (row) => row.tenNSX),
    },
    {
      key: 'sanPhamId',
      header: 'Sản phẩm',
      width: 160,
      renderCell: (v) =>
        lookupLabel('san-pham', v as string, (row) => row.tenSP),
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
      label: 'Sản phẩm',
      type: 'select',
      required: true,
      loadOptions: loadSanPhamOptions,
    },
    {
      key: 'nhaSanXuatId',
      label: 'Nhà sản xuất',
      type: 'select',
      required: true,
      loadOptions: loadNhaSanXuatOptions,
    },
    { key: 'maModel', label: 'Model Code', type: 'text' },
    { key: 'tenModel', label: 'Tên model', type: 'text', required: true },
    { key: 'ghiChu', label: 'Ghi chú', type: 'textarea', span: 2 },
  ],
  filters: [
    {
      key: 'sanPhamId',
      label: 'Sản phẩm',
      type: 'select',
      loadOptions: loadSanPhamOptions,
    },
    {
      key: 'nhaSanXuatId',
      label: 'Nhà sản xuất',
      type: 'select',
      loadOptions: loadNhaSanXuatOptions,
    },
    { key: 'tenModel', label: 'Tên model', type: 'text' },
  ],
}

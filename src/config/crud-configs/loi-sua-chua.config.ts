import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { LoiSuaChua } from '@/types/masterdata-types'
import { loiSuaChuaApi } from '@/mock/masterdata/loi-sua-chua.mock'
import { BRANCHES, NHOM_SAN_PHAM } from '@/mock/seed'

const branchName = (id: string) => BRANCHES.find((b) => b.id === id)?.name ?? id
const nhomSanPhamName = (id: string) =>
  NHOM_SAN_PHAM.find((n) => n.id === id)?.ten ?? id

export const loiSuaChuaConfig: CrudConfig<LoiSuaChua> = {
  resourceKey: 'loi-sua-chua',
  title: 'Lỗi Sửa Chữa',
  pageSize: 20,
  defaultSort: { key: 'tenLoi', dir: 'asc' },
  mockApi: loiSuaChuaApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'branchId', header: 'Chi Nhánh', width: 180, renderCell: (v) => branchName(v as string) },
    {
      key: 'nhomSanPhamId',
      header: 'Tên Nhóm Sản Phẩm',
      width: 170,
      renderCell: (v) => nhomSanPhamName(v as string),
    },
    { key: 'tenLoi', header: 'Tên Lỗi Sửa Chữa', sortable: true, width: 220 },
    {
      key: 'tienCong',
      header: 'Tiền Công',
      sortable: true,
      width: 120,
      renderCell: (v) => formatVND(v as number),
    },
    {
      key: 'tienCongDV',
      header: 'Tiền Công DV',
      sortable: true,
      width: 130,
      renderCell: (v) => formatVND(v as number),
    },
  ],
  fields: [
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      required: true,
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
    {
      key: 'nhomSanPhamId',
      label: 'Nhóm Sản Phẩm',
      type: 'select',
      required: true,
      options: NHOM_SAN_PHAM.map((n) => ({ label: n.ten, value: n.id })),
    },
    { key: 'tenLoi', label: 'Tên Sửa Chữa', type: 'textarea', span: 2 },
    { key: 'tienCong', label: 'Tiền công', type: 'money' },
    { key: 'tienCongDV', label: 'Tiền công DV', type: 'money' },
  ],
  filters: [
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
    { key: 'tenLoi', label: 'Tên lỗi', type: 'text' },
    {
      key: 'nhomSanPhamId',
      label: 'Nhóm Sản Phẩm',
      type: 'select',
      options: NHOM_SAN_PHAM.map((n) => ({ label: n.ten, value: n.id })),
    },
  ],
}

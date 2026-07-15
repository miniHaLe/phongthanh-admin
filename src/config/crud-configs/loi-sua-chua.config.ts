import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { LoiSuaChua } from '@/types/masterdata-types'
import { LOI_SUA_CHUA_ROWS } from '@/mock/masterdata/loi-sua-chua.mock'
import { BRANCH_NAME, BRANCHES, NHOM_SAN_PHAM } from '@/mock/seed'
import { apiFor, isReal } from '@/api/api-for'
import { lookupLabel } from '@/components/crud/lookup-label'
import { loadLookupOptions } from '@/hooks/use-lookup'

const nhomSanPhamName = (id: string) =>
  NHOM_SAN_PHAM.find((n) => n.id === id)?.ten ?? id
const loadChiNhanhOptions = () =>
  loadLookupOptions('chi-nhanh', (row) => row.tenChiNhanh)
const usesCanonicalBranchIds = isReal('loi-sua-chua')
const legacyBranchOptions = BRANCHES.map((branch) => ({
  label: branch.name,
  value: branch.id,
}))
const branchSelectOptions = usesCanonicalBranchIds
  ? { loadOptions: loadChiNhanhOptions }
  : { options: legacyBranchOptions }

function renderBranchName(id: string) {
  if (!usesCanonicalBranchIds) {
    return BRANCH_NAME[id as keyof typeof BRANCH_NAME] ?? id
  }

  return lookupLabel('chi-nhanh', id, (row) => row.tenChiNhanh)
}

export const loiSuaChuaConfig: CrudConfig<LoiSuaChua> = {
  resourceKey: 'loi-sua-chua',
  title: 'Lỗi Sửa Chữa',
  pageSize: 20,
  defaultSort: { key: 'tenLoi', dir: 'asc' },
  mockApi: apiFor('loi-sua-chua', LOI_SUA_CHUA_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    {
      key: 'branchId',
      header: 'Chi Nhánh',
      width: 180,
      renderCell: (v) => renderBranchName(v as string),
    },
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
      ...branchSelectOptions,
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
      ...branchSelectOptions,
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

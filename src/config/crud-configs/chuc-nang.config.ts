import type { CrudConfig } from '@/types/crud-types'
import type { ChucNang } from '@/types/masterdata-types'
import { chucNangApi, CHUC_NANG_ROWS } from '@/mock/masterdata/chuc-nang.mock'
import { MENU_ROWS } from '@/mock/masterdata/menu.mock'

/**
 * The /RoleFunction/Index reference page is broken (HTTP 500 — missing
 * Create partial), so no exact column/field spec could be mirrored. This
 * config models Chức Năng as a hierarchical entity-group → action-leaf
 * taxonomy (parentId), reconstructed from the RoleMenu function-permission
 * tree, so it can plausibly back that matrix's rows.
 */
export const chucNangConfig: CrudConfig<ChucNang> = {
  resourceKey: 'chuc-nang',
  title: 'Chức Năng',
  pageSize: 20,
  defaultSort: { key: 'maChucNang', dir: 'asc' },
  mockApi: chucNangApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'maChucNang', header: 'Mã chức năng', sortable: true, width: 130 },
    { key: 'tenChucNang', header: 'Tên chức năng', sortable: true, width: 220 },
    {
      key: 'parentId',
      header: 'Nhóm chức năng',
      width: 180,
      renderCell: (v) =>
        v
          ? (CHUC_NANG_ROWS.find((r) => r.id === v)?.tenChucNang ?? (v as string))
          : '—',
    },
    {
      key: 'menuId',
      header: 'Menu',
      width: 160,
      renderCell: (v) =>
        MENU_ROWS.find((r) => r.id === v)?.tenMenu ?? (v as string),
    },
    { key: 'moTa', header: 'Mô tả', width: 260, hidden: true },
    {
      key: 'active',
      header: 'Trạng thái',
      width: 100,
      renderCell: (v) => (v ? 'Hoạt động' : 'Tạm ngưng'),
    },
  ],
  fields: [
    { key: 'maChucNang', label: 'Mã chức năng', type: 'text', required: true },
    {
      key: 'tenChucNang',
      label: 'Tên chức năng',
      type: 'text',
      required: true,
    },
    {
      key: 'parentId',
      label: 'Nhóm chức năng (để trống nếu là nhóm gốc)',
      type: 'select',
      options: CHUC_NANG_ROWS.filter((r) => !r.parentId).map((r) => ({
        label: r.tenChucNang,
        value: r.id,
      })),
    },
    {
      key: 'menuId',
      label: 'Menu',
      type: 'select',
      required: true,
      options: MENU_ROWS.map((r) => ({ label: r.tenMenu, value: r.id })),
    },
    { key: 'moTa', label: 'Mô tả', type: 'textarea', span: 2 },
    { key: 'active', label: 'Trạng thái', type: 'switch' },
  ],
  filters: [
    { key: 'tenChucNang', label: 'Tên chức năng', type: 'text' },
    {
      key: 'parentId',
      label: 'Nhóm chức năng',
      type: 'select',
      options: CHUC_NANG_ROWS.filter((r) => !r.parentId).map((r) => ({
        label: r.tenChucNang,
        value: r.id,
      })),
    },
    {
      key: 'menuId',
      label: 'Menu',
      type: 'select',
      options: MENU_ROWS.map((r) => ({ label: r.tenMenu, value: r.id })),
    },
  ],
}

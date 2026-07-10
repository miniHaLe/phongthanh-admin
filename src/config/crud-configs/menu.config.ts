import type { CrudConfig } from '@/types/crud-types'
import type { Menu } from '@/types/masterdata-types'
import { menuApi } from '@/mock/masterdata/menu.mock'
import { MENU_ROWS } from '@/mock/masterdata/menu.mock'

/**
 * List/field metadata for Menu (RoleMenu). The page is hand-composed
 * (MenuPage.tsx) rather than driven through CrudTablePage/CrudSheet, since
 * the right-pane form embeds the 202-checkbox function-permission matrix —
 * this config still supplies the mock API + column/field metadata.
 * Reference list columns: Tên danh mục | Danh mục cha | Icon | Link | Number
 * (no Trạng thái — that column is a local invention, removed here).
 */
export const menuConfig: CrudConfig<Menu> = {
  resourceKey: 'menu',
  title: 'Menu',
  pageSize: 20,
  defaultSort: { key: 'thuTu', dir: 'asc' },
  mockApi: menuApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tenMenu', header: 'Tên danh mục', sortable: true, width: 200 },
    {
      key: 'parentId',
      header: 'Danh mục cha',
      width: 180,
      renderCell: (v) =>
        v ? (MENU_ROWS.find((r) => r.id === v)?.tenMenu ?? (v as string)) : '—',
    },
    { key: 'icon', header: 'Icon', width: 120 },
    { key: 'duongDan', header: 'Link', width: 220 },
    { key: 'thuTu', header: 'Number', sortable: true, width: 90 },
  ],
  fields: [
    {
      key: 'parentId',
      label: 'Danh mục cha',
      type: 'select',
      options: MENU_ROWS.map((r) => ({
        label: r.tenMenu,
        value: r.id,
      })),
    },
    { key: 'tenMenu', label: 'Tên danh mục', type: 'text', required: true },
    { key: 'duongDan', label: 'Link', type: 'text', required: true },
    { key: 'icon', label: 'Class icon', type: 'text' },
    { key: 'thuTu', label: 'Số thứ tự', type: 'number', required: true },
  ],
  filters: [
    {
      key: 'parentId',
      label: 'Danh mục cha',
      type: 'select',
      options: MENU_ROWS.filter((r) => !r.parentId).map((r) => ({
        label: r.tenMenu,
        value: r.id,
      })),
    },
  ],
}

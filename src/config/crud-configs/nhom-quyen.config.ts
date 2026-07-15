import { apiFor } from '@/api/api-for'
import type { CrudConfig } from '@/types/crud-types'
import type { NhomQuyen } from '@/types/masterdata-types'
import { NHOM_QUYEN_ROWS } from '@/mock/masterdata/nhom-quyen.mock'

/**
 * List/field metadata for Nhóm Quyền. The page itself is hand-composed
 * (NhomQuyenPage.tsx) rather than driven through CrudTablePage/CrudSheet,
 * since the right-pane form embeds the menu-permission tree — this config
 * still supplies the mock API + column/field metadata for consistency.
 * Reference list columns are exactly Mã + Nhóm quyền (no moTa/active shown).
 */
export const nhomQuyenConfig: CrudConfig<NhomQuyen> = {
  resourceKey: 'nhom-quyen',
  title: 'Nhóm Quyền',
  pageSize: 20,
  mockApi: apiFor('nhom-quyen', NHOM_QUYEN_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'maNhom', header: 'Mã', sortable: true, width: 110 },
    { key: 'tenNhom', header: 'Nhóm quyền', sortable: true, width: 220 },
  ],
  fields: [
    { key: 'maNhom', label: 'Mã', type: 'text', required: true },
    { key: 'tenNhom', label: 'Nhóm quyền', type: 'text', required: true },
  ],
}

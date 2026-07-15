import { apiFor } from '@/api/api-for'
import { lookupLabel } from '@/components/crud/lookup-label'
import { loadLookupOptions } from '@/hooks/use-lookup'
import type { CrudConfig } from '@/types/crud-types'
import type { NguoiDung } from '@/types/masterdata-types'
import { NGUOI_DUNG_ROWS } from '@/mock/masterdata/nguoi-dung.mock'

const loadChiNhanhOptions = () =>
  loadLookupOptions('chi-nhanh', (row) => row.tenChiNhanh)
const loadNhomQuyenOptions = () =>
  loadLookupOptions('nhom-quyen', (row) => row.tenNhom)

export const nguoiDungConfig: CrudConfig<NguoiDung> = {
  resourceKey: 'nguoi-dung',
  title: 'Người Dùng',
  pageSize: 20,
  defaultSort: { key: 'tenDangNhap', dir: 'asc' },
  mockApi: apiFor('nguoi-dung', NGUOI_DUNG_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  addLabel: 'Thêm người dùng',
  columns: [
    {
      key: 'chiNhanhId',
      header: 'Chi nhánh',
      width: 180,
      renderCell: (v) =>
        lookupLabel(
          'chi-nhanh',
          v as string | undefined,
          (row) => row.tenChiNhanh,
        ),
    },
    { key: 'tenDangNhap', header: 'Tên đăng nhập', sortable: true, width: 140 },
    { key: 'hoTen', header: 'Tên đầy đủ', sortable: true, width: 180 },
    { key: 'dienThoai', header: 'Điện thoại', width: 130 },
    { key: 'email', header: 'Email', width: 200 },
    {
      key: 'nhomQuyenId',
      header: 'Quyền',
      width: 160,
      renderCell: (v) =>
        lookupLabel(
          'nhom-quyen',
          v as string | undefined,
          (row) => row.tenNhom,
        ),
    },
    {
      key: 'locked',
      header: 'Khóa',
      width: 110,
      renderCell: (v) => (v ? 'Đã khóa' : 'Mở'),
    },
  ],
  fields: [
    {
      key: 'tenDangNhap',
      label: 'Tên đăng nhập',
      type: 'text',
      required: true,
    },
    { key: 'hoTen', label: 'Họ tên', type: 'text', required: true },
    // password shown in create mode only
    {
      key: 'password',
      label: 'Mật khẩu',
      type: 'text',
      required: true,
      createOnly: true,
    },
    { key: 'dienThoai', label: 'Điện thoại', type: 'phone' },
    { key: 'email', label: 'Email', type: 'email' },
    {
      key: 'chiNhanhId',
      label: 'Chi nhánh',
      type: 'select',
      required: true,
      loadOptions: loadChiNhanhOptions,
    },
    {
      key: 'nhomQuyenId',
      label: 'Quyền',
      type: 'select',
      required: true,
      loadOptions: loadNhomQuyenOptions,
    },
    { key: 'locked', label: 'Khóa tài khoản', type: 'switch' },
  ],
  filters: [
    { key: 'tenDangNhap', label: 'Tên đăng nhập', type: 'text' },
    { key: 'hoTen', label: 'Họ tên', type: 'text' },
    {
      key: 'chiNhanhId',
      label: 'Chi nhánh',
      type: 'select',
      loadOptions: loadChiNhanhOptions,
    },
    {
      key: 'nhomQuyenId',
      label: 'Nhóm quyền',
      type: 'select',
      loadOptions: loadNhomQuyenOptions,
    },
  ],
}

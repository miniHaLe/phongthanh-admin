import type { CrudConfig } from '@/types/crud-types'
import type { NguoiDung } from '@/types/masterdata-types'
import { nguoiDungApi } from '@/mock/masterdata/nguoi-dung.mock'
import { CHI_NHANH_ROWS } from '@/mock/masterdata/chi-nhanh.mock'
import { NHOM_QUYEN_ROWS } from '@/mock/masterdata/nhom-quyen.mock'

export const nguoiDungConfig: CrudConfig<NguoiDung> = {
  resourceKey: 'nguoi-dung',
  title: 'Người Dùng',
  pageSize: 20,
  defaultSort: { key: 'tenDangNhap', dir: 'asc' },
  mockApi: nguoiDungApi,
  bulkDelete: true,
  saveAndNew: true,
  addLabel: 'Thêm người dùng',
  columns: [
    {
      key: 'chiNhanhId',
      header: 'Chi nhánh',
      width: 180,
      renderCell: (v) =>
        CHI_NHANH_ROWS.find((r) => r.id === v)?.tenChiNhanh ?? (v as string),
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
        NHOM_QUYEN_ROWS.find((r) => r.id === v)?.tenNhom ?? (v as string),
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
      options: CHI_NHANH_ROWS.map((r) => ({
        label: r.tenChiNhanh,
        value: r.id,
      })),
    },
    {
      key: 'nhomQuyenId',
      label: 'Quyền',
      type: 'select',
      required: true,
      options: NHOM_QUYEN_ROWS.map((r) => ({ label: r.tenNhom, value: r.id })),
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
      options: CHI_NHANH_ROWS.map((r) => ({
        label: r.tenChiNhanh,
        value: r.id,
      })),
    },
    {
      key: 'nhomQuyenId',
      label: 'Nhóm quyền',
      type: 'select',
      options: NHOM_QUYEN_ROWS.map((r) => ({ label: r.tenNhom, value: r.id })),
    },
  ],
}

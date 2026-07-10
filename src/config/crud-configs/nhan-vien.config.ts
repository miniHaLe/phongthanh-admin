/**
 * Nhân Viên column/field metadata + mock-API wiring, consumed by both the
 * spec tests below and NhanVienPage (via useCrud for filter/sort/pagination
 * state). The live page hand-composes its own DataTable columns instead of
 * going through CrudTablePage: the Khóa/Mở khóa toggle action and the
 * full-page (not Sheet) edit navigation aren't expressible through
 * CrudTablePage's generic pencil+trash row-actions template — same
 * established deviation as BangLuongPage/ChamCongPage for views the generic
 * host can't render.
 */
import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { NhanVien } from '@/types/masterdata-types'
import { nhanVienApi } from '@/mock/masterdata/nhan-vien.mock'
import { PHONG_BAN_ROWS } from '@/mock/masterdata/phong-ban.mock'

export const nhanVienConfig: CrudConfig<NhanVien> = {
  resourceKey: 'nhan-vien',
  title: 'Nhân Viên',
  pageSize: 20,
  // Unlocked (active) rows first, then locked — matches the verified
  // reference sort order. `locked` is boolean; the shared mock sort
  // compares stringified values, and "false" sorts before "true".
  defaultSort: { key: 'locked', dir: 'asc' },
  mockApi: nhanVienApi,
  columns: [
    { key: 'photo', header: 'Hình', width: 60 },
    { key: 'maNV', header: 'Mã NV', sortable: true, width: 100 },
    { key: 'hoTen', header: 'Tên NV', sortable: true, width: 200 },
    {
      key: 'phongBanId',
      header: 'Phòng',
      width: 150,
      renderCell: (v) =>
        PHONG_BAN_ROWS.find((r) => r.id === v)?.tenPhongBan ?? (v as string),
    },
    {
      key: 'gioiTinh',
      header: 'Giới tính',
      width: 90,
      renderCell: (v) => (v ? 'Nam' : 'Nữ'),
    },
    {
      key: 'ngaySinh',
      header: 'Ngày sinh',
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    { key: 'soDienThoai', header: 'Điện thoại', width: 120 },
    { key: 'locked', header: 'Khóa', width: 90 },
  ],
  fields: [
    { key: 'maNV', label: 'Mã nhân viên', type: 'text', required: true },
    { key: 'hoTen', label: 'Họ tên', type: 'text', required: true },
    { key: 'ngaySinh', label: 'Ngày sinh', type: 'date', required: true },
    { key: 'soDienThoai', label: 'Số điện thoại', type: 'phone' },
    {
      key: 'phongBanId',
      label: 'Phòng ban',
      type: 'select',
      required: true,
      options: PHONG_BAN_ROWS.map((r) => ({
        label: r.tenPhongBan,
        value: r.id,
      })),
    },
    { key: 'luongCoBan', label: 'Lương cơ bản (₫)', type: 'money' },
  ],
  filters: [
    { key: 'hoTen', label: 'Mã/tên nhân viên', type: 'text' },
    {
      key: 'phongBanId',
      label: 'Phòng ban',
      type: 'select',
      options: PHONG_BAN_ROWS.map((r) => ({
        label: r.tenPhongBan,
        value: r.id,
      })),
    },
  ],
}

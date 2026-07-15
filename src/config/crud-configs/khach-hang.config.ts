// NOTE: This file uses .ts extension but contains no JSX — renderCell returns strings only.
import { formatDateTime } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { KhachHang } from '@/types/masterdata-types'
import { KHACH_HANG_ROWS } from '@/mock/masterdata/khach-hang.mock'
import { apiFor } from '@/api/api-for'
import { LOAI_KHACH_HANG } from '@/mock/seed/nhom-khach-hang'
import { TINH, QUAN, XA } from '@/mock/seed/tinh-quan-xa'
import { lookupLabel } from '@/components/crud/lookup-label'

const tinhName = (id?: string) =>
  id ? (TINH.find((t) => t.id === id)?.ten ?? id) : ''
const quanName = (id?: string) =>
  id ? (QUAN.find((q) => q.id === id)?.ten ?? id) : ''
const xaName = (id?: string) =>
  id ? (XA.find((x) => x.id === id)?.ten ?? id) : ''
const loaiName = (id: number) =>
  LOAI_KHACH_HANG.find((l) => l.id === id)?.ten ?? String(id)

export const khachHangConfig: CrudConfig<KhachHang> = {
  resourceKey: 'khach-hang',
  title: 'Khách Hàng',
  pageSize: 20,
  defaultSort: { key: 'createdAt', dir: 'desc' },
  // Dual-run seam: real API when `khach-hang` ∈ VITE_REAL_RESOURCES, else mock.
  mockApi: apiFor('khach-hang', KHACH_HANG_ROWS),
  bulkDelete: true,
  export: true,
  addLabel: false,
  columns: [
    { key: 'tenKH', header: 'Tên khách hàng', sortable: true, width: 200 },
    { key: 'dienThoai', header: 'Điện thoại', width: 120 },
    { key: 'dienThoai2', header: 'Điện thoại 2', width: 120 },
    { key: 'diaChi', header: 'Địa chỉ', width: 200 },
    {
      key: 'phuongXaId',
      header: 'Phường/Xã',
      width: 150,
      renderCell: (v) => xaName(v as string | undefined),
    },
    {
      key: 'quanId',
      header: 'Quận/Huyện',
      width: 150,
      renderCell: (v) => quanName(v as string | undefined),
    },
    {
      key: 'tinhId',
      header: 'Tỉnh',
      width: 120,
      renderCell: (v) => tinhName(v as string | undefined),
    },
    { key: 'email', header: 'Email', width: 180 },
    {
      key: 'loaiKhachHangId',
      header: 'Loại',
      width: 140,
      renderCell: (v) => loaiName(v as number),
    },
    {
      key: 'daiLyId',
      header: 'Đại lý/Trạm',
      width: 160,
      renderCell: (v) =>
        lookupLabel('khach-hang', v as string | undefined, (row) => row.tenKH),
    },
    { key: 'nguoiTao', header: 'Người tạo', width: 150 },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      width: 150,
      renderCell: (v) => formatDateTime(v as string),
    },
  ],
  fields: [
    { key: 'tenKH', label: 'Tên khách hàng', type: 'text', required: true },
    { key: 'dienThoai', label: 'Điện thoại', type: 'phone', required: true },
    { key: 'dienThoai2', label: 'Điện thoại 2', type: 'phone' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'diaChi', label: 'Địa chỉ', type: 'textarea', span: 2 },
    {
      key: 'tinhId',
      label: 'Tỉnh',
      type: 'select',
      options: TINH.map((t) => ({ label: t.ten, value: t.id })),
    },
    {
      key: 'quanId',
      label: 'Quận/Huyện',
      type: 'select',
      options: QUAN.map((q) => ({ label: q.ten, value: q.id })),
    },
    {
      key: 'phuongXaId',
      label: 'Phường/Xã',
      type: 'select',
      options: XA.map((x) => ({ label: x.ten, value: x.id })),
    },
    {
      key: 'loaiKhachHangId',
      label: 'Nhóm khách hàng',
      type: 'select',
      required: true,
      options: LOAI_KHACH_HANG.map((l) => ({
        label: l.ten,
        value: String(l.id),
      })),
    },
    { key: 'ghiChu', label: 'Ghi chú', type: 'textarea', span: 2 },
  ],
  filters: [
    {
      key: 'tinhId',
      label: 'Tỉnh',
      type: 'select',
      options: TINH.map((t) => ({ label: t.ten, value: t.id })),
    },
    {
      key: 'quanId',
      label: 'Quận',
      type: 'select',
      options: QUAN.map((q) => ({ label: q.ten, value: q.id })),
    },
    {
      key: 'loaiKhachHangId',
      label: 'Nhóm khách hàng',
      type: 'select',
      options: LOAI_KHACH_HANG.map((l) => ({
        label: l.ten,
        value: String(l.id),
      })),
    },
    { key: 'tenKH', label: 'Tên khách hàng', type: 'text' },
    { key: 'dienThoai', label: 'Số điện thoại', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'diaChi', label: 'Địa chỉ', type: 'text' },
  ],
}

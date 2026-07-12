// NOTE: This file uses .ts extension but contains no JSX — renderCell returns strings only.
import { formatDateTime } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { KhachHang } from '@/types/masterdata-types'
import { KHACH_HANG_ROWS } from '@/mock/masterdata/khach-hang.mock'
import { apiFor } from '@/api/api-for'
import { LOAI_KHACH_HANG } from '@/mock/seed/nhom-khach-hang'
import { VIETNAM_ADMINISTRATIVE_SNAPSHOT } from '@/data/vietnam-administrative-snapshot'
import { NGAN_HANG_ROWS } from '@/domains/hr/ngan-hang.mock'
import { z } from 'zod'

const tinhName = (code?: string | null) =>
  code
    ? (VIETNAM_ADMINISTRATIVE_SNAPSHOT.provinces.find(
        (item) => item.code === code,
      )?.name ?? code)
    : ''
const xaName = (code?: string | null) =>
  code
    ? (VIETNAM_ADMINISTRATIVE_SNAPSHOT.communes.find(
        (item) => item.code === code,
      )?.name ?? code)
    : ''
const bankName = (id?: string | null) =>
  id ? (NGAN_HANG_ROWS.find((item) => item.id === id)?.tenNganHang ?? id) : ''
const loaiName = (id: number) =>
  LOAI_KHACH_HANG.find((l) => l.id === id)?.ten ?? String(id)
const daiLyName = (id?: string | null) =>
  id ? (KHACH_HANG_ROWS.find((r) => r.id === id)?.tenKH ?? '') : ''

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
      key: 'phuongXaCode',
      header: 'Phường/Xã',
      width: 180,
      renderCell: (v) => xaName(v as string | undefined),
    },
    {
      key: 'tinhThanhCode',
      header: 'Tỉnh/Thành phố',
      width: 180,
      renderCell: (v) => tinhName(v as string | undefined),
    },
    { key: 'email', header: 'Email', width: 180 },
    { key: 'maSoThue', header: 'Mã số thuế', width: 140 },
    {
      key: 'nganHangId',
      header: 'Ngân hàng',
      width: 160,
      renderCell: (v, row) =>
        row.nganHangTen ?? bankName(v as string | null | undefined),
    },
    { key: 'soTaiKhoan', header: 'Số tài khoản', width: 160 },
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
      renderCell: (v) => daiLyName(v as string | undefined),
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
    { key: 'tenDuong', label: 'Tên đường', type: 'text', span: 2 },
    {
      key: 'tinhThanhCode',
      label: 'Tỉnh/Thành phố',
      type: 'select',
      options: VIETNAM_ADMINISTRATIVE_SNAPSHOT.provinces.map((item) => ({
        label: item.name,
        value: item.code,
      })),
    },
    {
      key: 'phuongXaCode',
      label: 'Phường/Xã',
      type: 'combobox',
      options: VIETNAM_ADMINISTRATIVE_SNAPSHOT.communes.map((item) => ({
        label: `${item.name} — ${item.provinceName}`,
        value: item.code,
      })),
    },
    {
      key: 'maSoThue',
      label: 'Mã số thuế',
      type: 'text',
      zodSchema: z
        .string()
        .regex(
          /^(?:\d{10}|\d{10}-\d{3})$/,
          'Mã số thuế phải có dạng 10 số hoặc 10 số-3 số',
        )
        .optional()
        .or(z.literal('')),
    },
    {
      key: 'nganHangId',
      label: 'Ngân hàng',
      type: 'select',
      options: NGAN_HANG_ROWS.map((item) => ({
        label: item.tenNganHang,
        value: item.id,
      })),
    },
    { key: 'soTaiKhoan', label: 'Số tài khoản', type: 'text', span: 2 },
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
      key: 'tinhThanhCode',
      label: 'Tỉnh/Thành phố',
      type: 'select',
      options: VIETNAM_ADMINISTRATIVE_SNAPSHOT.provinces.map((item) => ({
        label: item.name,
        value: item.code,
      })),
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
    { key: 'maSoThue', label: 'Mã số thuế', type: 'text' },
  ],
}

/**
 * CrudConfig for Ton Kho (inventory stock view).
 * Read-focused: columns map to TonKho fields. No complex create form needed.
 */
import { formatVND, formatNumber } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { TonKho } from '@/types/inventory-types'
import { tonKhoApi } from '@/mock/inventory-mock'
import { NHA_KHO_ROWS } from '@/mock/masterdata'

const khoOptions = NHA_KHO_ROWS.map((k) => ({
  label: k.tenNhaKho,
  value: k.id,
}))

const NHOM_OPTIONS = [
  { label: 'Pin', value: 'Pin' },
  { label: 'Màn hình', value: 'Màn hình' },
  { label: 'Camera', value: 'Camera' },
  { label: 'Bo mạch', value: 'Bo mạch' },
  { label: 'Linh kiện khác', value: 'Linh kiện khác' },
]

export const tonKhoConfig: CrudConfig<TonKho> = {
  resourceKey: 'ton-kho',
  title: 'Tồn Kho',
  pageSize: 20,
  defaultSort: { key: 'ten_hang', dir: 'asc' },
  mockApi: tonKhoApi,
  columns: [
    { key: 'ma_hang', header: 'Mã hàng', sortable: true, width: 110 },
    { key: 'ten_hang', header: 'Tên hàng', sortable: true, width: 200 },
    { key: 'nhom', header: 'Nhóm', width: 130 },
    { key: 'dvt', header: 'ĐVT', width: 70 },
    {
      key: 'kho_id',
      header: 'Kho',
      width: 160,
      renderCell: (v) =>
        NHA_KHO_ROWS.find((k) => k.id === v)?.tenNhaKho ?? (v as string),
    },
    {
      key: 'ton_dau_ky',
      header: 'Tồn đầu kỳ',
      sortable: true,
      width: 110,
      renderCell: (v) => formatNumber(v as number),
    },
    {
      key: 'nhap_trong_ky',
      header: 'Nhập kỳ',
      width: 100,
      renderCell: (v) => formatNumber(v as number),
    },
    {
      key: 'xuat_trong_ky',
      header: 'Xuất kỳ',
      width: 100,
      renderCell: (v) => formatNumber(v as number),
    },
    {
      key: 'ton_cuoi_ky',
      header: 'Tồn cuối kỳ',
      sortable: true,
      width: 110,
      renderCell: (v) => formatNumber(v as number),
    },
    {
      key: 'gia_tri',
      header: 'Giá trị',
      sortable: true,
      width: 140,
      renderCell: (v) => formatVND(v as number),
    },
  ],
  fields: [
    { key: 'ma_hang', label: 'Mã hàng', type: 'text', required: true },
    { key: 'ten_hang', label: 'Tên hàng', type: 'text', required: true },
    { key: 'nhom', label: 'Nhóm', type: 'text' },
    { key: 'dvt', label: 'ĐVT', type: 'text' },
    {
      key: 'kho_id',
      label: 'Kho',
      type: 'select',
      required: true,
      options: khoOptions,
    },
    { key: 'ton_dau_ky', label: 'Tồn đầu kỳ', type: 'number' },
    { key: 'nhap_trong_ky', label: 'Nhập trong kỳ', type: 'number' },
    { key: 'xuat_trong_ky', label: 'Xuất trong kỳ', type: 'number' },
  ],
  filters: [
    { key: 'ten_hang', label: 'Tên hàng', type: 'text' },
    { key: 'nhom', label: 'Nhóm hàng', type: 'select', options: NHOM_OPTIONS },
    { key: 'kho_id', label: 'Kho', type: 'select', options: khoOptions },
  ],
}

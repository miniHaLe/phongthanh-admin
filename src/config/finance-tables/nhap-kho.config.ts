/**
 * CrudConfig for Nhap Kho (goods receipt / stock entry).
 */
import { formatVND, formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { NhapKho } from '@/types/inventory-types'
import { nhapKhoApi } from '@/mock/inventory-mock'
import { NHA_KHO_ROWS } from '@/mock/masterdata'
import { BRANCHES } from '@/mock/seed/branches'
import { renderFinancePill } from './render-finance-pill'

const khoOptions = NHA_KHO_ROWS.map((k) => ({
  label: k.tenNhaKho,
  value: k.id,
}))

export const nhapKhoConfig: CrudConfig<NhapKho> = {
  resourceKey: 'nhap-kho',
  title: 'Nhập Kho',
  pageSize: 20,
  defaultSort: { key: 'ngay_nhap', dir: 'desc' },
  mockApi: nhapKhoApi,
  columns: [
    { key: 'ma', header: 'Mã phiếu', sortable: true, width: 120 },
    { key: 'kho_ten', header: 'Kho nhập', width: 180 },
    { key: 'nha_cung_cap', header: 'Nhà cung cấp', width: 200 },
    {
      key: 'ngay_nhap',
      header: 'Ngày nhập',
      sortable: true,
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    {
      key: 'tong_tien',
      header: 'Tổng tiền',
      sortable: true,
      width: 130,
      renderCell: (v) => formatVND(v as number),
    },
    { key: 'nguoi_tao', header: 'Người tạo', width: 140, hidden: true },
    {
      key: 'trang_thai',
      header: 'Trạng thái',
      width: 120,
      renderCell: (v) => renderFinancePill(v as string),
    },
    {
      key: 'branchId',
      header: 'Chi nhánh',
      width: 110,
      renderCell: (v) =>
        BRANCHES.find((b) => b.id === v)?.name ?? (v as string),
    },
  ],
  fields: [
    { key: 'ma', label: 'Mã phiếu', type: 'text', required: true },
    {
      key: 'kho_id',
      label: 'Kho nhập',
      type: 'select',
      required: true,
      options: khoOptions,
    },
    {
      key: 'nha_cung_cap',
      label: 'Nhà cung cấp',
      type: 'text',
      required: true,
    },
    { key: 'ngay_nhap', label: 'Ngày nhập', type: 'date', required: true },
    { key: 'nguoi_tao', label: 'Người tạo', type: 'text' },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ duyệt', value: 'Cho duyet' },
        { label: 'Đã duyệt', value: 'Da duyet' },
      ],
    },
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      required: true,
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
  ],
  filters: [
    { key: 'nha_cung_cap', label: 'Nhà cung cấp', type: 'text' },
    { key: 'kho_id', label: 'Kho', type: 'select', options: khoOptions },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ duyệt', value: 'Cho duyet' },
        { label: 'Đã duyệt', value: 'Da duyet' },
      ],
    },
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
  ],
}

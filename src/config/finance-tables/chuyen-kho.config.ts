/**
 * CrudConfig for Chuyen Kho (stock transfers).
 */
import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { ChuyenKho } from '@/types/inventory-types'
import { chuyenKhoApi } from '@/mock/inventory-mock'
import { NHA_KHO_ROWS } from '@/mock/masterdata'
import { BRANCHES } from '@/mock/seed/branches'
import { renderFinancePill } from './render-finance-pill'

const khoOptions = NHA_KHO_ROWS.map((k) => ({
  label: k.tenNhaKho,
  value: k.id,
}))

export const chuyenKhoConfig: CrudConfig<ChuyenKho> = {
  resourceKey: 'chuyen-kho',
  title: 'Chuyển Kho',
  pageSize: 20,
  defaultSort: { key: 'ngay_chuyen', dir: 'desc' },
  mockApi: chuyenKhoApi,
  columns: [
    { key: 'ma', header: 'Mã phiếu', sortable: true, width: 120 },
    { key: 'kho_nguon_ten', header: 'Kho nguồn', width: 180 },
    { key: 'kho_dich_ten', header: 'Kho đích', width: 180 },
    { key: 'nhan_vien', header: 'Nhân viên', width: 150 },
    {
      key: 'ngay_chuyen',
      header: 'Ngày chuyển',
      sortable: true,
      width: 120,
      renderCell: (v) => formatDate(v as string),
    },
    {
      key: 'trang_thai',
      header: 'Trạng thái',
      width: 140,
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
      key: 'kho_nguon_id',
      label: 'Kho nguồn',
      type: 'select',
      required: true,
      options: khoOptions,
    },
    {
      key: 'kho_dich_id',
      label: 'Kho đích',
      type: 'select',
      required: true,
      options: khoOptions,
    },
    { key: 'nhan_vien', label: 'Nhân viên', type: 'text', required: true },
    { key: 'ngay_chuyen', label: 'Ngày chuyển', type: 'date', required: true },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ xác nhận', value: 'Cho xac nhan' },
        { label: 'Hoàn thành', value: 'Hoan thanh' },
        { label: 'Hủy', value: 'Huy' },
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
    {
      key: 'kho_nguon_id',
      label: 'Kho nguồn',
      type: 'select',
      options: khoOptions,
    },
    {
      key: 'kho_dich_id',
      label: 'Kho đích',
      type: 'select',
      options: khoOptions,
    },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ xác nhận', value: 'Cho xac nhan' },
        { label: 'Hoàn thành', value: 'Hoan thanh' },
        { label: 'Hủy', value: 'Huy' },
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

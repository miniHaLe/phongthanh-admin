/**
 * CrudConfig for Danh Sach Tra Linh Kien (parts return list).
 */
import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { DsTraLK } from '@/types/inventory-types'
import { dsTraLKApi } from '@/mock/inventory-mock'
import { BRANCHES } from '@/mock/seed/branches'
import { renderFinancePill } from './render-finance-pill'

export const dsTraLKConfig: CrudConfig<DsTraLK> = {
  resourceKey: 'ds-tra-lk',
  title: 'Danh Sách Trả Linh Kiện',
  pageSize: 20,
  defaultSort: { key: 'ngay_tra', dir: 'desc' },
  mockApi: dsTraLKApi,
  columns: [
    { key: 'ma', header: 'Mã phiếu', sortable: true, width: 130 },
    { key: 'cap_lk_ma', header: 'Phiếu cấp LK', width: 130 },
    { key: 'ky_thuat_vien', header: 'Kỹ thuật viên', width: 160 },
    {
      key: 'ngay_tra',
      header: 'Ngày trả',
      sortable: true,
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    { key: 'ly_do', header: 'Lý do', width: 200 },
    {
      key: 'trang_thai',
      header: 'Trạng thái',
      width: 130,
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
      key: 'cap_lk_ma',
      label: 'Mã phiếu cấp LK',
      type: 'text',
      required: true,
    },
    {
      key: 'ky_thuat_vien',
      label: 'Kỹ thuật viên',
      type: 'text',
      required: true,
    },
    { key: 'ngay_tra', label: 'Ngày trả', type: 'date', required: true },
    { key: 'ly_do', label: 'Lý do', type: 'textarea', required: true, span: 2 },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ xác nhận', value: 'Cho xac nhan' },
        { label: 'Đã trả', value: 'Da tra' },
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
    { key: 'ky_thuat_vien', label: 'Kỹ thuật viên', type: 'text' },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ xác nhận', value: 'Cho xac nhan' },
        { label: 'Đã trả', value: 'Da tra' },
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

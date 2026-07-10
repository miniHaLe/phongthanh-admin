/**
 * Hàng Hóa (C5) config — drives the bespoke HangHoaPage list (edit routes to
 * the C5b full-page editor rather than the generic Sheet, so `fields` here is
 * unused by the page but kept so the config satisfies CrudConfig<T> and stays
 * the single source of truth the column-header spec test asserts against).
 */
import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { HangHoa } from '@/types/masterdata-types'
import { hangHoaApi } from '@/mock/masterdata/hang-hoa.mock'
import { NHOM_HANG_HOA_ROWS } from '@/mock/masterdata/nhom-hang-hoa.mock'
import { DON_VI_TINH_ROWS } from '@/mock/masterdata/don-vi-tinh.mock'
import { NHA_SAN_XUAT_ROWS } from '@/mock/masterdata/nha-san-xuat.mock'
import { MODEL_ROWS } from '@/mock/masterdata/model.mock'

const nsxName = (id?: string) =>
  id ? (NHA_SAN_XUAT_ROWS.find((r) => r.id === id)?.tenNSX ?? id) : ''
const modelName = (id?: string) =>
  id ? (MODEL_ROWS.find((r) => r.id === id)?.tenModel ?? id) : ''

export const hangHoaConfig: CrudConfig<HangHoa> = {
  resourceKey: 'hang-hoa',
  title: 'Hàng Hóa',
  pageSize: 20,
  defaultSort: { key: 'maHH', dir: 'asc' },
  mockApi: hangHoaApi,
  bulkDelete: true,
  export: true,
  addLabel: false,
  columns: [
    { key: 'hinh', header: 'Hình', width: 60, renderCell: () => null },
    { key: 'maHH', header: 'Mã hàng', sortable: true, width: 110 },
    { key: 'maHHPhu', header: 'Mã hàng phụ', width: 110 },
    { key: 'tenHH', header: 'Tên hàng', sortable: true, width: 200 },
    { key: 'tenTiengAnh', header: 'Tiếng Anh', width: 180 },
    {
      key: 'nhomHangHoaId',
      header: 'Nhóm hàng hóa',
      width: 160,
      renderCell: (v) =>
        NHOM_HANG_HOA_ROWS.find((r) => r.id === v)?.tenNhom ?? (v as string),
    },
    {
      key: 'nhaSanXuatId',
      header: 'Nhà sản xuất',
      width: 140,
      renderCell: (v) => nsxName(v as string | undefined),
    },
    {
      key: 'modelId',
      header: 'Tên model',
      width: 150,
      renderCell: (v) => modelName(v as string | undefined),
    },
    {
      key: 'modelDungChungText',
      header: 'Model dùng chung',
      width: 200,
      renderCell: (v) => (v as string | undefined) ?? '',
    },
    {
      key: 'donViTinhId',
      header: 'Đơn vị',
      width: 90,
      renderCell: (v) =>
        DON_VI_TINH_ROWS.find((r) => r.id === v)?.tenDVT ?? (v as string),
    },
    { key: 'nguoiTao', header: 'Người tạo', width: 150 },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    {
      key: 'coSerial',
      header: 'Serial',
      width: 80,
      renderCell: (v) => (v ? 'Có' : '-'),
    },
  ],
  fields: [
    {
      key: 'nhomHangHoaId',
      label: 'Nhóm hàng hóa',
      type: 'select',
      required: true,
      options: NHOM_HANG_HOA_ROWS.map((r) => ({
        label: r.tenNhom,
        value: r.id,
      })),
    },
    { key: 'maHH', label: 'Mã hàng hóa', type: 'text', required: true },
    { key: 'maHHPhu', label: 'Mã hàng hóa phụ', type: 'text' },
    { key: 'tenHH', label: 'Tên hàng hóa', type: 'text', required: true },
    { key: 'tenTiengAnh', label: 'Tên Tiếng Anh', type: 'text' },
    {
      key: 'donViTinhId',
      label: 'Đơn vị tính',
      type: 'select',
      required: true,
      options: DON_VI_TINH_ROWS.map((r) => ({ label: r.tenDVT, value: r.id })),
    },
    { key: 'coSerial', label: 'Có Serial', type: 'switch' },
    { key: 'giaMua', label: 'Giá mua', type: 'money' },
    { key: 'giaBanSi', label: 'Giá bán sỉ', type: 'money' },
    { key: 'giaBanLe', label: 'Giá bán lẻ', type: 'money' },
  ],
  filters: [
    {
      key: 'nhomHangHoaId',
      label: 'Nhóm hàng hóa',
      type: 'select',
      options: NHOM_HANG_HOA_ROWS.map((r) => ({
        label: r.tenNhom,
        value: r.id,
      })),
    },
    {
      key: 'nhaSanXuatId',
      label: 'Nhà sản xuất',
      type: 'select',
      options: NHA_SAN_XUAT_ROWS.map((r) => ({ label: r.tenNSX, value: r.id })),
    },
    { key: 'maHH', label: 'Mã hàng hóa', type: 'text' },
    { key: 'tenHH', label: 'Tên hàng hóa', type: 'text' },
    {
      key: 'modelId',
      label: 'Model',
      type: 'select',
      options: MODEL_ROWS.map((r) => ({ label: r.tenModel, value: r.id })),
    },
  ],
}

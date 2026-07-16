/**
 * Hàng Hóa (C5) config — drives the bespoke HangHoaPage list (edit routes to
 * the C5b full-page editor rather than the generic Sheet, so `fields` here is
 * unused by the page but kept so the config satisfies CrudConfig<T> and stays
 * the single source of truth the column-header spec test asserts against).
 */
import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { HangHoa } from '@/types/masterdata-types'
import { HANG_HOA_ROWS } from '@/mock/masterdata/hang-hoa.mock'
import { apiFor } from '@/api/api-for'
import { lookupLabel } from '@/components/crud/lookup-label'
import { loadLookupOptions } from '@/hooks/use-lookup'

const loadNhomHangHoaOptions = () =>
  loadLookupOptions('nhom-hang-hoa', (row) => row.tenNhom)
const loadDonViTinhOptions = () =>
  loadLookupOptions('don-vi-tinh', (row) => row.tenDVT)
const loadNhaSanXuatOptions = () =>
  loadLookupOptions('nha-san-xuat', (row) => row.tenNSX)
const loadModelOptions = () =>
  loadLookupOptions('model', (row) => row.tenModel)

export const hangHoaConfig: CrudConfig<HangHoa> = {
  resourceKey: 'hang-hoa',
  title: 'Hàng Hóa',
  pageSize: 20,
  defaultSort: { key: 'maHH', dir: 'asc' },
  mockApi: apiFor('hang-hoa', HANG_HOA_ROWS),
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
        lookupLabel('nhom-hang-hoa', v as string, (row) => row.tenNhom),
    },
    {
      key: 'nhaSanXuatId',
      header: 'Nhà sản xuất',
      width: 140,
      renderCell: (v) =>
        lookupLabel('nha-san-xuat', v as string | undefined, (row) => row.tenNSX),
    },
    {
      key: 'modelId',
      header: 'Tên model',
      width: 150,
      renderCell: (v) =>
        lookupLabel('model', v as string | undefined, (row) => row.tenModel),
    },
    {
      key: 'modelDungChungText',
      header: 'Model dùng chung',
      width: 200,
      // Sparsely populated free-text; demoted below the 1366px fold by default
      // to reduce overflow. Restorable via the "Cột" menu; kept in Excel export.
      hidden: true,
      renderCell: (v) => (v as string | undefined) ?? '',
    },
    {
      key: 'donViTinhId',
      header: 'Đơn vị',
      width: 90,
      renderCell: (v) =>
        lookupLabel('don-vi-tinh', v as string, (row) => row.tenDVT),
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
      loadOptions: loadNhomHangHoaOptions,
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
      loadOptions: loadDonViTinhOptions,
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
      loadOptions: loadNhomHangHoaOptions,
    },
    {
      key: 'nhaSanXuatId',
      label: 'Nhà sản xuất',
      type: 'select',
      loadOptions: loadNhaSanXuatOptions,
    },
    { key: 'maHH', label: 'Mã hàng hóa', type: 'text' },
    { key: 'tenHH', label: 'Tên hàng hóa', type: 'text' },
    {
      key: 'modelId',
      label: 'Model',
      type: 'select',
      loadOptions: loadModelOptions,
    },
  ],
}

// NOTE: This file uses .ts extension but contains no JSX — renderCell returns strings only.
import { formatDateTime } from '@/lib/format'
import type { CrudConfig, CrudLookups } from '@/types/crud-types'
import type { KhachHang } from '@/types/masterdata-types'
import { KHACH_HANG_ROWS } from '@/mock/masterdata/khach-hang.mock'
import { apiFor } from '@/api/api-for'
import { LOAI_KHACH_HANG } from '@/mock/seed/nhom-khach-hang'
import { TINH, XA } from '@/mock/seed/tinh-quan-xa'

const CUSTOMER_PROVINCE_NAMES_LOOKUP = 'customerProvinceNames'
const CUSTOMER_COMMUNE_NAMES_LOOKUP = 'customerCommuneNames'

const legacyProvinceNames = new Map(TINH.map((item) => [item.id, item.ten]))
const legacyCommuneNames = new Map(XA.map((item) => [item.id, item.ten]))

function lookupName(
  lookups: CrudLookups | undefined,
  lookupKey: string,
  code?: string | null,
): string | undefined {
  if (!code) return undefined
  const names = lookups?.[lookupKey] as ReadonlyMap<string, string> | undefined
  return names?.get(code)
}

const tinhName = (
  code?: string | null,
  legacyId?: string | null,
  lookups?: CrudLookups,
) =>
  lookupName(lookups, CUSTOMER_PROVINCE_NAMES_LOOKUP, code) ??
  (legacyId ? legacyProvinceNames.get(legacyId) : undefined) ??
  '—'
const xaName = (
  code?: string | null,
  legacyId?: string | null,
  lookups?: CrudLookups,
) =>
  lookupName(lookups, CUSTOMER_COMMUNE_NAMES_LOOKUP, code) ??
  (legacyId ? legacyCommuneNames.get(legacyId) : undefined) ??
  '—'
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
    // Demoted below the 1366px fold by default; restorable via the "Cột" menu.
    { key: 'dienThoai2', header: 'Điện thoại 2', width: 120, hidden: true },
    { key: 'diaChi', header: 'Địa chỉ', width: 200 },
    {
      key: 'phuongXaCode',
      header: 'Phường/Xã',
      width: 180,
      renderCell: (v, row, lookups) =>
        xaName(v as string | undefined, row.phuongXaId, lookups),
    },
    {
      key: 'tinhThanhCode',
      header: 'Tỉnh/Thành phố',
      width: 180,
      renderCell: (v, row, lookups) =>
        tinhName(v as string | undefined, row.tinhId, lookups),
    },
    { key: 'email', header: 'Email', width: 180 },
    { key: 'maSoThue', header: 'Mã số thuế', width: 140, hidden: true },
    {
      key: 'nganHangId',
      header: 'Ngân hàng',
      width: 160,
      hidden: true,
      renderCell: (_v, row) => row.nganHangTen ?? '—',
    },
    { key: 'soTaiKhoan', header: 'Số tài khoản', width: 160, hidden: true },
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
      renderCell: (_v, row) => row.daiLyTen ?? '—',
    },
    { key: 'nguoiTao', header: 'Người tạo', width: 150, hidden: true },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      width: 150,
      renderCell: (v) => formatDateTime(v as string),
    },
  ],
  // Customer create/edit uses the shared customer form, never CrudSheet.
  fields: [],
  filters: [
    {
      key: 'tinhThanhCode',
      label: 'Tỉnh/Thành phố',
      type: 'select',
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

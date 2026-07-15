/**
 * Chấm Công — exception-record CRUD (Nghỉ / Nghỉ nữa ngày / Đi trễ / Tăng ca /
 * Về sớm + Loại trừ lương), replacing the previous invented clock-in/out
 * model. `Số lượng` is a single numeric field for every Loại chấm công value
 * (the reference conditionally relabels/hides it per type — CrudSheet's
 * static FieldConfig[] has no per-value conditional rendering, so this is a
 * documented simplification, not a missing requirement).
 */
import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { ChamCongRecord } from '@/domains/hr/types'
import { chamCongRecordApi } from '@/domains/hr/cham-cong.mock'
import { NHAN_VIEN_ROWS } from '@/mock/masterdata'
import { CHUC_VU_ROWS } from '@/mock/masterdata/chuc-vu.mock'
import { KY } from '@/mock/seed/ky'
import { LOAI_CHAM, LOAI_TRU } from '@/mock/seed/cham-cong'
import { lookupLabel } from '@/components/crud/lookup-label'

function nv(id: string) {
  return NHAN_VIEN_ROWS.find((r) => r.id === id)
}
const KY_LABEL = (id: string) => KY.find((k) => k.id === id)?.ten ?? id
const LOAI_CHAM_LABEL = (v: number) =>
  LOAI_CHAM.find((l) => l.id === v)?.ten ?? String(v)
const LOAI_TRU_LABEL = (v: number) =>
  LOAI_TRU.find((l) => l.id === v)?.ten ?? String(v)

export const chamCongConfig: CrudConfig<ChamCongRecord> = {
  resourceKey: 'cham-cong',
  title: 'Chấm Công',
  pageSize: 20,
  mockApi: chamCongRecordApi,
  bulkDelete: true,
  columns: [
    {
      key: 'nhanVienId',
      header: 'Tên NV',
      width: 180,
      renderCell: (v) => {
        const r = nv(v as string)
        return r ? `${r.maNV} - ${r.hoTen}` : (v as string)
      },
    },
    {
      key: 'nhanVienId',
      header: 'Giới tính',
      width: 90,
      renderCell: (v) => {
        const r = nv(v as string)
        return r?.gioiTinh === undefined ? '—' : r.gioiTinh ? 'Nam' : 'Nữ'
      },
    },
    {
      key: 'nhanVienId',
      header: 'Chức danh',
      width: 170,
      renderCell: (v) => {
        const r = nv(v as string)
        return CHUC_VU_ROWS.find((c) => c.id === r?.chucVuId)?.tenChucVu ?? '—'
      },
    },
    {
      key: 'nhanVienId',
      header: 'Chi nhánh',
      width: 150,
      renderCell: (v) => {
        const r = nv(v as string)
        return lookupLabel(
          'chi-nhanh',
          r?.chiNhanhId,
          (branch) => branch.tenChiNhanh,
          '—',
        )
      },
    },
    {
      key: 'loaiCham',
      header: 'Loại chấm',
      width: 130,
      renderCell: (v) => LOAI_CHAM_LABEL(v as number),
    },
    {
      key: 'soLuong',
      header: 'Chấm công',
      width: 110,
      renderCell: (_v, row) => `${row.soLuong} (${row.donVi})`,
    },
    {
      key: 'ngayCham',
      header: 'Ngày chấm công',
      width: 130,
      renderCell: (v) => formatDate(v as string),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      width: 130,
      renderCell: (v) => formatDate(v as string),
    },
    {
      key: 'kyId',
      header: 'Kỳ',
      width: 90,
      renderCell: (v) => KY_LABEL(v as string),
    },
    {
      key: 'loaiTru',
      header: 'Loại trừ',
      width: 130,
      renderCell: (v) => LOAI_TRU_LABEL(v as number),
    },
  ],
  fields: [
    {
      key: 'nhanVienId',
      label: 'Nhân viên',
      type: 'select',
      required: true,
      options: NHAN_VIEN_ROWS.map((r) => ({
        label: `${r.maNV} - ${r.hoTen}`,
        value: r.id,
      })),
    },
    { key: 'ngayCham', label: 'Ngày chấm', type: 'date', required: true },
    {
      key: 'kyId',
      label: 'Kỳ',
      type: 'select',
      required: true,
      options: KY.map((k) => ({ label: k.ten, value: k.id })),
    },
    {
      key: 'loaiCham',
      label: 'Loại chấm công',
      type: 'select',
      required: true,
      options: LOAI_CHAM.map((l) => ({ label: l.ten, value: String(l.id) })),
    },
    { key: 'soLuong', label: 'Số lượng', type: 'number', required: true },
    {
      key: 'loaiTru',
      label: 'Loại trừ lương',
      type: 'select',
      required: true,
      options: LOAI_TRU.map((l) => ({ label: l.ten, value: String(l.id) })),
    },
  ],
  filters: [
    {
      key: 'nhanVienId',
      label: 'Tên Nhân Viên',
      type: 'select',
      options: NHAN_VIEN_ROWS.map((r) => ({ label: r.hoTen, value: r.id })),
    },
    {
      key: 'kyId',
      label: 'Kỳ',
      type: 'select',
      options: KY.map((k) => ({ label: k.ten, value: k.id })),
    },
  ],
}

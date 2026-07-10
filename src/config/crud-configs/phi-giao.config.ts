import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { PhiGiao } from '@/types/masterdata-types'
import { phiGiaoApi } from '@/mock/masterdata/phi-giao.mock'
import { SAN_PHAM, LOAI_PHI } from '@/mock/seed'

const sanPhamName = (id: string | null) =>
  id ? (SAN_PHAM.find((s) => s.id === id)?.ten ?? id) : '—'
const loaiPhiName = (id: number) => LOAI_PHI.find((l) => l.id === id)?.ten ?? String(id)

export const phiGiaoConfig: CrudConfig<PhiGiao> = {
  resourceKey: 'phi-giao',
  title: 'Phí Giao',
  pageSize: 20,
  mockApi: phiGiaoApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'sanPhamId', header: 'Sản phẩm', width: 180, renderCell: (v) => sanPhamName(v as string | null) },
    { key: 'tenPhi', header: 'Tên phí', sortable: true, width: 200 },
    {
      key: 'soTien',
      header: 'Số tiền',
      sortable: true,
      width: 120,
      renderCell: (v) => formatVND(v as number),
    },
    { key: 'loaiPhi', header: 'Loại phí', width: 100, renderCell: (v) => loaiPhiName(v as number) },
    { key: 'ghiChu', header: 'Ghi chú', width: 220 },
  ],
  fields: [
    {
      key: 'sanPhamId',
      label: 'Sản phẩm',
      type: 'select',
      options: [
        { label: 'Không chọn', value: '' },
        ...SAN_PHAM.map((s) => ({ label: s.ten, value: s.id })),
      ],
    },
    { key: 'tenPhi', label: 'Tên phí giao', type: 'text', required: true },
    { key: 'soTien', label: 'Số tiền', type: 'money', required: true },
    {
      key: 'loaiPhi',
      label: 'Loại phí',
      type: 'select',
      required: true,
      options: LOAI_PHI.map((l) => ({ label: l.ten, value: String(l.id) })),
    },
    { key: 'ghiChu', label: 'Ghi chú', type: 'text' },
  ],
  filters: [
    { key: 'tenPhi', label: 'Tên phí giao', type: 'text' },
    {
      key: 'sanPhamId',
      label: 'Sản phẩm',
      type: 'select',
      options: SAN_PHAM.map((s) => ({ label: s.ten, value: s.id })),
    },
  ],
}

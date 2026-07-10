/**
 * TanStack Table column definitions for the repair list — the 14 reference
 * columns of Index_8 with rich cells. Column visibility persists via
 * useTableState. A fixed reference "now" drives the Tồn: dwell counter so no
 * wall clock leaks into the rendered rows.
 */
import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { MapPin, Navigation } from 'lucide-react'
import { useTableState } from '@/components/shared/data-table/use-table-state'
import { buildSelectionColumn } from '@/components/shared'
import { formatVND, formatDate, formatDateTime, formatDwell } from '@/lib/format'
import { STATUS_HEX, STATUS_LABEL } from '@/domains/repair/status'
import {
  HINH_THUC_LABEL,
  LOAI_BAO_HANH_LABEL,
  type RepairTicket,
} from '@/domains/repair/types'
import { openExternal, buildMapUrl } from '@/lib/open-external'
import { ROUTES } from '@/constants/routes'
import { RowActionsCell } from '../components/row-actions-cell'
import { DispatchCell } from '../components/dispatch-cell'

export const TABLE_ID = 'repair-list'

/** Fixed reference clock for the Tồn: dwell counter (no wall clock). */
const REF_NOW = new Date('2024-07-01T00:00:00.000Z').getTime()

export const REPAIR_COLUMN_LABELS: Array<{ id: string; label: string }> = [
  { id: 'tinhTrang', label: 'Trạng thái' },
  { id: 'actions', label: 'Hành động' },
  { id: 'soPhieu', label: 'Phiếu sửa chữa' },
  { id: 'khachHang', label: 'Khách hàng' },
  { id: 'sanPham', label: 'Sản phẩm' },
  { id: 'kyThuat', label: 'Kỹ thuật' },
  { id: 'loaiSc', label: 'Loại SC' },
  { id: 'chiPhi', label: 'Chi phí' },
  { id: 'ngayNhan', label: 'Ngày nhận' },
  { id: 'ngayHt', label: 'Ngày HT' },
  { id: 'suaChua', label: 'Sửa chữa' },
  { id: 'ghiChu', label: 'Ghi chú' },
  { id: 'nguoiNhan', label: 'Người nhận' },
]

interface UseRepairTableColumnsReturn {
  columns: ColumnDef<RepairTicket, unknown>[]
  columnVisibility: Record<string, boolean>
  setColumnVisibility: (v: Record<string, boolean>) => void
}

export function useRepairTableColumns(): UseRepairTableColumnsReturn {
  const { getTable, setColumnVisibility: persistVisibility } = useTableState()
  const columnVisibility = getTable(TABLE_ID).columnVisibility

  const columns = useMemo<ColumnDef<RepairTicket, unknown>[]>(
    () => [
      // 1. Checkbox column (Chọn tất cả header toggle)
      buildSelectionColumn<RepairTicket>(),

      // 2. Trạng thái
      {
        id: 'tinhTrang',
        accessorKey: 'tinhTrang',
        header: '#',
        enableSorting: true,
        cell: ({ row }) => {
          const id = row.original.tinhTrang
          return (
            <div
              className="flex min-h-[36px] items-center justify-center px-1"
              style={{ backgroundColor: STATUS_HEX[id] }}
            >
              <span className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">
                {STATUS_LABEL[id]}
              </span>
            </div>
          )
        },
      },

      // 3. Hành động
      {
        id: 'actions',
        header: '#',
        enableSorting: false,
        cell: ({ row }) => <RowActionsCell ticket={row.original} />,
      },

      // 4. Phiếu sửa chữa
      {
        id: 'soPhieu',
        accessorKey: 'soPhieu',
        header: 'Phiếu sửa chữa',
        enableSorting: true,
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="min-w-[120px]">
              <Link
                to={ROUTES.repairDetail(t.id)}
                className="font-mono text-sm font-semibold text-primary hover:underline"
                title={`Hư hỏng: ${t.moTaLoi}\nĐịa chỉ: ${t.khachHang.diaChi}\nCN: ${t.branchId}`}
              >
                {t.soPhieu}
              </Link>
              {t.soPhieuHang && (
                <p className="text-xs text-muted-foreground">
                  PSC hãng: {t.soPhieuHang}
                </p>
              )}
              {t.soPhieuDaiLy && (
                <p className="text-xs text-muted-foreground">
                  PSC DL: {t.soPhieuDaiLy}
                </p>
              )}
            </div>
          )
        },
      },

      // 5. Khách hàng
      {
        id: 'khachHang',
        header: 'Khách hàng',
        enableSorting: false,
        cell: ({ row }) => {
          const kh = row.original.khachHang
          return (
            <div className="min-w-[160px]">
              <p className="text-sm font-bold">{kh.ten}</p>
              <p className="text-xs text-muted-foreground">{kh.sdt}</p>
              <p className="text-xs text-muted-foreground">{kh.diaChi}</p>
              <div className="mt-0.5 flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                  onClick={() => openExternal(buildMapUrl(kh.diaChi))}
                >
                  <MapPin className="size-3" /> Bản đồ
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                  onClick={() => openExternal(buildMapUrl(`${kh.tinh} ${kh.huyen}`))}
                >
                  <Navigation className="size-3" /> Định vị
                </button>
              </div>
            </div>
          )
        },
      },

      // 6. Sản phẩm
      {
        id: 'sanPham',
        accessorKey: 'tenSanPham',
        header: 'Sản phẩm',
        enableSorting: true,
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="max-w-[220px]">
              <p className="truncate text-sm">{t.tenSanPham}</p>
              {t.soSerial && (
                <p
                  className={
                    t.laMayDaSua
                      ? 'truncate text-xs font-semibold text-destructive'
                      : 'truncate text-xs text-muted-foreground'
                  }
                  title={t.laMayDaSua ? 'Máy đã từng sửa chữa' : undefined}
                >
                  Serial: {t.soSerial}
                </p>
              )}
              {t.daiLy && (
                <p className="truncate text-xs text-orange-600">Đại lý: {t.daiLy}</p>
              )}
            </div>
          )
        },
      },

      // 7. Kỹ thuật
      {
        id: 'kyThuat',
        header: 'Kỹ thuật',
        enableSorting: false,
        cell: ({ row }) => <DispatchCell ticket={row.original} />,
      },

      // 8. Loại SC
      {
        id: 'loaiSc',
        header: 'Loại SC',
        enableSorting: false,
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="min-w-[120px] text-xs">
              <p>{HINH_THUC_LABEL[t.hinhThuc]}</p>
              {t.loaiBaoHanh && <p>{LOAI_BAO_HANH_LABEL[t.loaiBaoHanh]}</p>}
              {t.khuVuc && <p className="text-muted-foreground">KV: {t.khuVuc}</p>}
            </div>
          )
        },
      },

      // 9. Chi phí
      {
        id: 'chiPhi',
        accessorKey: 'chiPhiDuKien',
        header: 'Chi phí',
        enableSorting: true,
        cell: ({ row }) => {
          const t = row.original
          if (t.giaBaoGia != null) {
            return (
              <span className="whitespace-nowrap text-sm tabular-nums">
                {formatVND(t.giaBaoGia)}
              </span>
            )
          }
          return (
            <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
              {formatVND(t.chiPhiDuKien)}
            </span>
          )
        },
      },

      // 10. Ngày nhận
      {
        id: 'ngayNhan',
        accessorKey: 'ngayNhan',
        header: 'Ngày nhận',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums">
            {formatDateTime(row.original.ngayNhan)}
          </span>
        ),
      },

      // 11. Ngày HT
      {
        id: 'ngayHt',
        accessorKey: 'ngayHoanThanh',
        header: 'Ngày HT',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
            {row.original.ngayHoanThanh
              ? formatDate(row.original.ngayHoanThanh)
              : '—'}
          </span>
        ),
      },

      // 12. Sửa chữa (progress)
      {
        id: 'suaChua',
        header: 'Sửa chữa',
        enableSorting: false,
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="min-w-[150px] text-xs">
              {t.ngaySuaXong && (
                <p className="text-emerald-600">
                  Sửa xong: {formatDateTime(t.ngaySuaXong)}
                </p>
              )}
              {t.ngaySuaXong && (
                <p>
                  TAT:{' '}
                  {Math.max(
                    0,
                    Math.round(
                      (new Date(t.ngaySuaXong).getTime() -
                        new Date(t.ngayNhan).getTime()) /
                        86_400_000,
                    ),
                  )}{' '}
                  ngày
                </p>
              )}
              {t.ngayGiao && <p>Giao máy: {formatDateTime(t.ngayGiao)}</p>}
              {!t.ngaySuaXong && (
                <p className="text-orange-600">
                  Tồn: {formatDwell(t.ngayNhan, REF_NOW)}
                </p>
              )}
            </div>
          )
        },
      },

      // 13. Ghi chú
      {
        id: 'ghiChu',
        header: 'Ghi chú',
        enableSorting: false,
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="max-w-[180px] text-xs">
              <p className="line-clamp-2">
                <span className="font-semibold text-destructive">HH:</span>{' '}
                {t.moTaLoi}
              </p>
              {t.cachGiaiQuyet && (
                <p className="line-clamp-1 text-muted-foreground">
                  {t.cachGiaiQuyet}
                </p>
              )}
            </div>
          )
        },
      },

      // 14. Người nhận
      {
        id: 'nguoiNhan',
        accessorKey: 'nguoiNhan',
        header: 'Người nhận',
        enableSorting: true,
        cell: ({ row }) => (
          <span
            className="whitespace-nowrap text-sm"
            title={row.original.nguoiNhan}
          >
            {row.original.nguoiNhan}
          </span>
        ),
      },
    ],
    [],
  )

  return {
    columns,
    columnVisibility,
    setColumnVisibility: (v: Record<string, boolean>) =>
      persistVisibility(TABLE_ID, v),
  }
}

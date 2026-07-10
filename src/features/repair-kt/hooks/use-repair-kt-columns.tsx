/**
 * TanStack Table column definitions for the KT board — the 14 reference
 * columns of RepairingM/Index. Modeled on use-repair-table-columns.tsx but a
 * distinct column set (own action set: view detail + photo upload).
 */
import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatVND, formatDate, formatDateTime } from '@/lib/format'
import { STATUS_HEX, STATUS_LABEL } from '@/domains/repair/status'
import { HINH_THUC_LABEL, type RepairTicket } from '@/domains/repair/types'
import { ROUTES } from '@/constants/routes'
import { UpdateImageModal } from '../UpdateImageModal'

export const TABLE_ID = 'repair-kt'

export const REPAIR_KT_COLUMN_LABELS: Array<{ id: string; label: string }> = [
  { id: 'tinhTrang', label: 'Trạng thái' },
  { id: 'actions', label: 'Hành động' },
  { id: 'soPhieu', label: 'Phiếu sửa chữa' },
  { id: 'khachHang', label: 'Khách hàng' },
  { id: 'sanPham', label: 'Thông tin sản phẩm' },
  { id: 'kyThuat', label: 'Kỹ thuật' },
  { id: 'loaiSc', label: 'Loại SC' },
  { id: 'chiPhi', label: 'Chi phí' },
  { id: 'ngayNhan', label: 'Ngày nhận' },
  { id: 'ngayGiao', label: 'Ngày giao' },
  { id: 'chiTietSc', label: 'Chi tiết SC' },
  { id: 'ghiChu', label: 'Ghi chú' },
  { id: 'nguoiNhan', label: 'Người nhận' },
  { id: 'khuVuc', label: 'Khu vực' },
]

/** Row action cell: view detail + photo-upload button opening UpdateImageModal. */
function KtActionsCell({ ticket }: { ticket: RepairTicket }) {
  const navigate = useNavigate()
  const [imageOpen, setImageOpen] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Xem chi tiết"
        onClick={() => navigate(ROUTES.repairDetail(ticket.id))}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Cập nhật hình ảnh"
        onClick={() => setImageOpen(true)}
      >
        <Camera className="size-4" />
      </Button>
      {imageOpen && (
        <UpdateImageModal
          open={imageOpen}
          onOpenChange={setImageOpen}
          ticketId={ticket.id}
        />
      )}
    </div>
  )
}

interface UseRepairKtColumnsReturn {
  columns: ColumnDef<RepairTicket, unknown>[]
}

export function useRepairKtColumns(): UseRepairKtColumnsReturn {
  const columns = useMemo<ColumnDef<RepairTicket, unknown>[]>(
    () => [
      // 1. Trạng thái — full-cell status color block
      {
        id: 'tinhTrang',
        accessorKey: 'tinhTrang',
        header: '#',
        enableSorting: false,
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

      // 2. Hành động
      {
        id: 'actions',
        header: '#',
        enableSorting: false,
        cell: ({ row }) => <KtActionsCell ticket={row.original} />,
      },

      // 3. Phiếu sửa chữa
      {
        id: 'soPhieu',
        accessorKey: 'soPhieu',
        header: 'Phiếu sửa chữa',
        enableSorting: false,
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="min-w-[120px]">
              <Link
                to={ROUTES.repairDetail(t.id)}
                className="font-mono text-sm font-semibold text-primary hover:underline"
              >
                {t.soPhieu}
              </Link>
              {t.soPhieuHang && (
                <p className="text-xs text-muted-foreground">
                  PSC hãng: {t.soPhieuHang}
                </p>
              )}
            </div>
          )
        },
      },

      // 4. Khách hàng
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
            </div>
          )
        },
      },

      // 5. Thông tin sản phẩm
      {
        id: 'sanPham',
        accessorKey: 'tenSanPham',
        header: 'Thông tin sản phẩm',
        enableSorting: false,
        cell: ({ row }) => {
          const t = row.original
          return (
            <div className="max-w-[220px]">
              <p className="truncate text-sm">{t.tenSanPham}</p>
              {t.soSerial && (
                <p className="truncate text-xs text-muted-foreground">
                  Serial: {t.soSerial}
                </p>
              )}
            </div>
          )
        },
      },

      // 6. Kỹ thuật
      {
        id: 'kyThuat',
        accessorKey: 'kyThuat',
        header: 'Kỹ thuật',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {row.original.kyThuat || '—'}
          </span>
        ),
      },

      // 7. Loại SC
      {
        id: 'loaiSc',
        header: 'Loại SC',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {HINH_THUC_LABEL[row.original.hinhThuc]}
          </span>
        ),
      },

      // 8. Chi phí
      {
        id: 'chiPhi',
        accessorKey: 'chiPhiDuKien',
        header: 'Chi phí',
        enableSorting: false,
        cell: ({ row }) => {
          const t = row.original
          const value = t.giaBaoGia ?? t.chiPhiDuKien
          return (
            <span className="whitespace-nowrap text-sm tabular-nums">
              {formatVND(value)}
            </span>
          )
        },
      },

      // 9. Ngày nhận
      {
        id: 'ngayNhan',
        accessorKey: 'ngayNhan',
        header: 'Ngày nhận',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums">
            {formatDateTime(row.original.ngayNhan)}
          </span>
        ),
      },

      // 10. Ngày giao
      {
        id: 'ngayGiao',
        accessorKey: 'ngayGiao',
        header: 'Ngày giao',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
            {row.original.ngayGiao ? formatDate(row.original.ngayGiao) : '—'}
          </span>
        ),
      },

      // 11. Chi tiết SC
      {
        id: 'chiTietSc',
        header: 'Chi tiết SC',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="max-w-[200px] text-xs">
            <p className="line-clamp-2">
              {row.original.noiDungSuaChua ?? '—'}
            </p>
          </div>
        ),
      },

      // 12. Ghi chú
      {
        id: 'ghiChu',
        accessorKey: 'ghiChu',
        header: 'Ghi chú',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="max-w-[160px] text-xs">
            <p className="line-clamp-2">{row.original.ghiChu ?? '—'}</p>
          </div>
        ),
      },

      // 13. Người nhận
      {
        id: 'nguoiNhan',
        accessorKey: 'nguoiNhan',
        header: 'Người nhận',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {row.original.nguoiNhan}
          </span>
        ),
      },

      // 14. Khu vực
      {
        id: 'khuVuc',
        accessorKey: 'khuVuc',
        header: 'Khu vực',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {row.original.khuVuc ?? '—'}
          </span>
        ),
      },
    ],
    [],
  )

  return { columns }
}

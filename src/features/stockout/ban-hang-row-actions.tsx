/**
 * "Chọn" cell for the Bán Hàng list — Thêm hình (image-upload modal),
 * Chỉnh sửa (→ edit editor route), Xuất kho (print), Chi tiết modal.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, Pencil, Printer, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatVND, formatDateTime } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import type { SellingOrder } from '@/domains/warehouse/types'
import { printSelling } from './prints/stockout-prints'
import { VoucherDetailModal } from './voucher-detail-modal'
import { ImageUploadModal } from './image-upload-modal'

export function BanHangRowActions({ row }: { row: SellingOrder }) {
  const navigate = useNavigate()
  const [detailOpen, setDetailOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Thêm hình"
        onClick={() => setImageOpen(true)}
      >
        <ImagePlus className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Chỉnh sửa"
        onClick={() => navigate(ROUTES.stockOutSalesEdit(row.id))}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Xuất kho"
        onClick={() => void printSelling(row)}
      >
        <Printer className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Chi tiết"
        onClick={() => setDetailOpen(true)}
      >
        <Eye className="size-4" />
      </Button>
      {detailOpen && (
        <VoucherDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={`Chi tiết phiếu ${row.soPhieu}`}
          rows={[
            { label: 'Số phiếu', value: row.soPhieu },
            { label: 'Ngày lập', value: formatDateTime(row.ngayLap) },
            { label: 'Khách hàng', value: row.khachHang },
            { label: 'Điện thoại', value: row.dienThoai },
            { label: 'Tổng tiền', value: formatVND(row.tongTien) },
            { label: 'Người lập', value: row.nguoiLap },
            { label: 'Ghi chú', value: row.ghiChu || '—' },
          ]}
        />
      )}
      {imageOpen && (
        <ImageUploadModal
          open={imageOpen}
          onOpenChange={setImageOpen}
          title={`Thêm hình — ${row.soPhieu}`}
        />
      )}
    </div>
  )
}

/**
 * "Chọn" cell for the Chuyển Kho list — print + Chi tiết modal. A per-row
 * confirm-receipt action (Chưa xác nhận → Đã xác nhận) is not implemented
 * here; only the read-only actions (print/detail) are in scope for this list.
 */
import { useState } from 'react'
import { Printer, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import type { MovingSlip } from '@/domains/warehouse/types'
import { printMovingProduct } from './prints/stockout-prints'
import { VoucherDetailModal } from './voucher-detail-modal'

export function ChuyenKhoRowActions({ row }: { row: MovingSlip }) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="In"
        onClick={() => void printMovingProduct(row)}
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
            { label: 'Trạng thái', value: row.trangThai },
            { label: 'Số phiếu', value: row.soPhieu },
            { label: 'Ngày lập', value: formatDateTime(row.ngayLap) },
            { label: 'Từ chi nhánh', value: row.tuChiNhanh },
            { label: 'Từ kho', value: row.tuKho },
            { label: 'Đến chi nhánh', value: row.denChiNhanh },
            { label: 'Đến kho', value: row.denKho },
            { label: 'Loại', value: row.loai },
            { label: 'Người chuyển', value: row.nguoiChuyen },
          ]}
        />
      )}
    </div>
  )
}

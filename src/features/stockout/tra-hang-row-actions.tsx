/**
 * "Chọn" cell for the Trả Hàng list — Chỉnh sửa (→ reuses the create editor
 * route, since there is no separate edit route for returns), print, Chi tiết
 * modal.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Printer, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import type { ReturnSlip } from '@/domains/warehouse/types'
import { printReturnProduct } from './prints/stockout-prints'
import { VoucherDetailModal } from './voucher-detail-modal'

export function TraHangRowActions({ row }: { row: ReturnSlip }) {
  const navigate = useNavigate()
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Chỉnh sửa"
        onClick={() => navigate(ROUTES.stockOutReturnsCreate)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="In"
        onClick={() => void printReturnProduct(row)}
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
            { label: 'Ngày trả', value: formatDateTime(row.ngayTra) },
            { label: 'Hình thức trả', value: row.hinhThucTra },
            { label: 'Người lập', value: row.nguoiLap },
          ]}
        />
      )}
    </div>
  )
}

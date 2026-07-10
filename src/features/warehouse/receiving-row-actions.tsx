/**
 * "Chọn" cell for the Nhập Kho list — per-row In (print) + Chi tiết (detail
 * modal) actions. Kept out of NhapKhoPage.tsx to keep that file focused.
 */
import { useState } from 'react'
import { Eye, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatVND, formatDateTime } from '@/lib/format'
import type { ReceivingVoucher } from '@/domains/warehouse/types'
import { printReceiving } from './prints/warehouse-prints'
import { VoucherDetailModal } from './voucher-detail-modal'

export function ReceivingRowActions({ row }: { row: ReceivingVoucher }) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="In"
        onClick={() => void printReceiving(row)}
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
            { label: 'Số đặt hàng', value: row.soDatHang || '—' },
            { label: 'Số hóa đơn', value: row.soHoaDon || '—' },
            { label: 'Nhà cung cấp', value: row.nhaCungCap },
            { label: 'Hình thức thanh toán', value: row.hinhThucThanhToan },
            { label: 'Nhà kho', value: row.khoTen },
            { label: 'Số tiền', value: formatVND(row.soTien) },
            { label: 'Người lập', value: row.nguoiLap },
            { label: 'Ngày lập', value: formatDateTime(row.ngayLap) },
            { label: 'Ghi chú', value: row.ghiChu || '—' },
          ]}
        />
      )}
    </div>
  )
}

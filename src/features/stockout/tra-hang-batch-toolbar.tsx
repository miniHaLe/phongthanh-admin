/**
 * Trả Hàng bulk toolbar — Tìm kiếm (refetch), Xuất ra Excel, Xuất Excel Chi
 * Tiết over the filtered row set.
 */
import { Button } from '@/components/ui/button'
import { exportToXlsx } from '@/lib/export-xlsx'
import type { ReturnSlip } from '@/domains/warehouse/types'

interface TraHangBatchToolbarProps {
  allRows: ReturnSlip[]
  onSearch: () => void
}

const EXPORT_COLUMNS = [
  { header: 'Số phiếu', accessor: (r: ReturnSlip) => r.soPhieu },
  { header: 'Ngày trả', accessor: (r: ReturnSlip) => r.ngayTra },
  { header: 'Hình thức trả', accessor: (r: ReturnSlip) => r.hinhThucTra },
  { header: 'Người lập', accessor: (r: ReturnSlip) => r.nguoiLap },
]

export function TraHangBatchToolbar({ allRows, onSearch }: TraHangBatchToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" className="h-8" onClick={onSearch}>
        Tìm kiếm
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          void exportToXlsx({
            filename: 'tra-hang',
            sheetName: 'Trả Hàng',
            columns: EXPORT_COLUMNS,
            rows: allRows,
          })
        }
      >
        Xuất ra Excel
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          void exportToXlsx({
            filename: 'tra-hang-chi-tiet',
            sheetName: 'Trả Hàng Chi Tiết',
            columns: EXPORT_COLUMNS,
            rows: allRows,
          })
        }
      >
        Xuất Excel Chi Tiết
      </Button>
    </div>
  )
}

/**
 * Chuyển Kho bulk toolbar — Tìm kiếm (refetch), Xuất Excel, Xuất Excel Chi
 * Tiết over the filtered row set.
 */
import { Button } from '@/components/ui/button'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import type { MovingSlip } from '@/domains/warehouse/types'

interface ChuyenKhoBatchToolbarProps {
  allRows: MovingSlip[]
  onSearch: () => void
}

const EXPORT_COLUMNS = [
  { header: 'Trạng thái', accessor: (r: MovingSlip) => r.trangThai },
  { header: 'Số phiếu', accessor: (r: MovingSlip) => r.soPhieu },
  { header: 'Ngày lập', accessor: (r: MovingSlip) => r.ngayLap },
  { header: 'Từ chi nhánh', accessor: (r: MovingSlip) => r.tuChiNhanh },
  { header: 'Từ kho', accessor: (r: MovingSlip) => r.tuKho },
  { header: 'Đến chi nhánh', accessor: (r: MovingSlip) => r.denChiNhanh },
  { header: 'Đến kho', accessor: (r: MovingSlip) => r.denKho },
  { header: 'Loại', accessor: (r: MovingSlip) => r.loai },
  { header: 'Người chuyển', accessor: (r: MovingSlip) => r.nguoiChuyen },
]

export function ChuyenKhoBatchToolbar({
  allRows,
  onSearch,
}: ChuyenKhoBatchToolbarProps) {
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
          void exportListXlsx({
            filename: 'chuyen-kho',
            sheetName: 'Chuyển Kho',
            columns: EXPORT_COLUMNS,
            rows: allRows,
          })
        }
      >
        Xuất Excel
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          void exportListXlsx({
            filename: 'chuyen-kho-chi-tiet',
            sheetName: 'Chuyển Kho Chi Tiết',
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

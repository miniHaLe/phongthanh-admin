/**
 * DSTraLKXac batch toolbar — bulk Trả hàng (opens the "Trả linh kiện" modal
 * collecting a Mã vận đơn), In BB Kỹ Thuật, In Phiếu Trả Hãng, Xuất Excel.
 * Each print/action alerts "Vui lòng chọn phiếu để …" when nothing is checked.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { notify } from '@/components/shared'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import type { PartReturnXac } from '@/domains/warehouse/types'
import {
  printBienBanKyThuat,
  printPhieuTraHang,
} from './prints/warehouse-prints'
import { TraHangModal } from './tra-hang-modal'

interface PartReturnXacBatchToolbarProps {
  selected: PartReturnXac[]
  allRows: PartReturnXac[]
  onReload: () => void
}

const EXPORT_COLUMNS = [
  { header: 'Tình trạng', accessor: (r: PartReturnXac) => r.tinhTrang },
  { header: 'Mã vận đơn', accessor: (r: PartReturnXac) => r.maVanDon },
  { header: 'Số phiếu cấp', accessor: (r: PartReturnXac) => r.soPhieuCap },
  { header: 'Số phiếu SC', accessor: (r: PartReturnXac) => r.soPhieuSC },
  { header: 'Số phiếu hãng', accessor: (r: PartReturnXac) => r.soPhieuHang },
  { header: 'Model', accessor: (r: PartReturnXac) => r.model },
  { header: 'Serial', accessor: (r: PartReturnXac) => r.serial },
  { header: 'Nhà kho', accessor: (r: PartReturnXac) => r.nhaKho },
  { header: 'NSX', accessor: (r: PartReturnXac) => r.nsx },
  { header: 'Mã hàng', accessor: (r: PartReturnXac) => r.maHang },
  { header: 'Tên hàng', accessor: (r: PartReturnXac) => r.tenHang },
  { header: 'Kĩ thuật', accessor: (r: PartReturnXac) => r.kyThuat },
  { header: 'Mục đích', accessor: (r: PartReturnXac) => r.mucDich },
  { header: 'SL', accessor: (r: PartReturnXac) => r.sl },
  { header: 'Ngày tạo', accessor: (r: PartReturnXac) => r.ngayTao },
  { header: 'Người tạo', accessor: (r: PartReturnXac) => r.nguoiTao },
]

export function PartReturnXacBatchToolbar({
  selected,
  allRows,
  onReload,
}: PartReturnXacBatchToolbarProps) {
  const [traHangOpen, setTraHangOpen] = useState(false)
  const ids = selected.map((r) => r.id)

  function requireSelection(action: string): boolean {
    if (ids.length === 0) {
      notify.error(`Vui lòng chọn phiếu để ${action}`)
      return false
    }
    return true
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() => requireSelection('trả') && setTraHangOpen(true)}
      >
        Trả hàng
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          requireSelection('in') && void printBienBanKyThuat(selected)
        }
      >
        In BB Kỹ Thuật
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          requireSelection('in') && void printPhieuTraHang(selected)
        }
      >
        In Phiếu Trả Hãng
      </Button>
      <Button size="sm" variant="ghost" className="h-8" onClick={onReload}>
        Tải lại trang
      </Button>

      <div className="flex-1" />

      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          void exportListXlsx({
            filename: 'ds-tra-lk-xac',
            sheetName: 'Trả linh kiện xác',
            columns: EXPORT_COLUMNS,
            rows: allRows,
          })
        }
      >
        Xuất Excel
      </Button>

      {traHangOpen && (
        <TraHangModal
          open={traHangOpen}
          onOpenChange={setTraHangOpen}
          ids={ids}
        />
      )}
    </div>
  )
}

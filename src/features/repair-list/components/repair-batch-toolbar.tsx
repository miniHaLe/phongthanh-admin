/**
 * Repair list actions — grouped print/export commands plus selection-gated
 * bulk operations. In Biên nhận gates on status ≥ Sửa Xong; In Lệnh Sửa Tại
 * Nhà opens "Điều phối in" when checked rows span multiple technicians.
 */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { BulkActionsBar, PrintMenu, notify } from '@/components/shared'
import { exportToXlsx } from '@/lib/export-xlsx'
import { formatDate } from '@/lib/format'
import { STATUS_LABEL, type RepairStatusId } from '@/domains/repair/status'
import { HINH_THUC_LABEL, type RepairTicket } from '@/domains/repair/types'
import { LOI_SUA_CHUA } from '@/domains/repair/reference-data'
import { deleteTickets } from '@/domains/repair/mock-mutations'
import { fetchRepairList } from '@/domains/repair/mock-data'
import type { RepairListFilters } from '@/domains/repair/types'
import {
  printBienNhan,
  printPhieuSc,
  printTemDanMay,
  printGiayDiDuong,
  printLenhSuaTaiNha,
} from '../prints/repair-prints'
import { TransferBranchModal } from './transfer-branch-modal'
import { DispatchTechnicianModal } from './dispatch-technician-modal'

const REPAIRED_STATUS_IDS = new Set<RepairStatusId>([9, 10])

interface RepairBatchToolbarProps {
  selected: RepairTicket[]
  filters: RepairListFilters
  total: number
}

const EXPORT_COLUMNS = [
  { header: 'Số phiếu', accessor: (t: RepairTicket) => t.soPhieu },
  { header: 'Khách hàng', accessor: (t: RepairTicket) => t.khachHang.ten },
  { header: 'Điện thoại', accessor: (t: RepairTicket) => t.khachHang.sdt },
  { header: 'Sản phẩm', accessor: (t: RepairTicket) => t.tenSanPham },
  { header: 'Kỹ thuật', accessor: (t: RepairTicket) => t.kyThuat },
  {
    header: 'Tình trạng',
    accessor: (t: RepairTicket) => STATUS_LABEL[t.tinhTrang],
  },
  {
    header: 'Hình thức',
    accessor: (t: RepairTicket) => HINH_THUC_LABEL[t.hinhThuc],
  },
  { header: 'Chi phí dự kiến', accessor: (t: RepairTicket) => t.chiPhiDuKien },
]

const PRINT_EXPORT_COLUMNS = [
  { header: 'Phiếu sửa chữa', accessor: (t: RepairTicket) => t.soPhieu },
  {
    header: 'Khách hàng',
    accessor: (t: RepairTicket) => `${t.khachHang.ten} - ${t.khachHang.sdt}`,
  },
  {
    header: 'Sản phẩm',
    accessor: (t: RepairTicket) =>
      [t.tenSanPham, t.soSerial].filter(Boolean).join(' - '),
  },
  { header: 'Kỹ thuật', accessor: (t: RepairTicket) => t.kyThuat },
  {
    header: 'Loại SC',
    accessor: (t: RepairTicket) => HINH_THUC_LABEL[t.hinhThuc],
  },
  { header: 'Chi phí', accessor: (t: RepairTicket) => t.chiPhiThucTe },
  {
    header: 'Ngày nhận',
    accessor: (t: RepairTicket) => formatDate(t.ngayNhan),
  },
  {
    header: 'Ngày HT',
    accessor: (t: RepairTicket) => formatDate(t.ngayHoanThanh),
  },
  {
    header: 'Sửa chữa',
    accessor: (t: RepairTicket) =>
      t.noiDungSuaChua ||
      t.loiSuaChua
        .map((id) => LOI_SUA_CHUA.find((item) => item.id === id)?.ten)
        .filter(Boolean)
        .join(', '),
  },
  { header: 'Ghi chú', accessor: (t: RepairTicket) => t.ghiChu },
  { header: 'Người nhận', accessor: (t: RepairTicket) => t.nguoiNhan },
]

export function RepairBatchToolbar({
  selected,
  filters,
  total,
}: RepairBatchToolbarProps) {
  const qc = useQueryClient()
  const [transferOpen, setTransferOpen] = useState(false)
  const [dispatchPrintOpen, setDispatchPrintOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const ids = selected.map((t) => t.id)

  function requireSelection(action: string): boolean {
    if (ids.length === 0) {
      notify.error(`Vui lòng chọn phiếu để ${action}`)
      return false
    }
    return true
  }

  function handleBienNhan() {
    if (!requireSelection('in biên nhận')) return
    const printable = selected.find((t) => REPAIRED_STATUS_IDS.has(t.tinhTrang))
    if (!printable) {
      notify.error('Vui lòng chọn phiếu để đã sửa xong để in')
      return
    }
    void printBienNhan(printable)
  }

  function handleLenhSuaTaiNha() {
    if (!requireSelection('in lệnh sửa tại nhà')) return
    const techs = new Set(selected.map((t) => t.kyThuatId).filter(Boolean))
    if (techs.size !== 1) {
      // Mixed / no technician → open "Điều phối in" first.
      setDispatchPrintOpen(true)
      return
    }
    void printLenhSuaTaiNha(selected)
  }

  async function handleExport(printLayout = false) {
    // Re-fetch the full filtered set (ignore pagination) for the export.
    const res = await fetchRepairList({
      ...filters,
      page: 1,
      pageSize: total || 1,
    })
    await exportToXlsx({
      filename: printLayout ? 'sua-chua-in' : 'sua-chua',
      sheetName: 'Sửa chữa',
      columns: printLayout ? PRINT_EXPORT_COLUMNS : EXPORT_COLUMNS,
      rows: res.data,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <PrintMenu
          disabled={ids.length === 0}
          items={[
            { label: 'In Biên nhận', onSelect: handleBienNhan },
            {
              label: 'In Giấy Đi Đường',
              onSelect: () => {
                if (!requireSelection('in giấy đi đường')) return
                void printGiayDiDuong(selected)
              },
            },
            {
              label: 'In Lệnh Sửa Tại Nhà',
              onSelect: handleLenhSuaTaiNha,
            },
            {
              label: 'In Phiếu SC',
              onSelect: () => {
                if (!requireSelection('in phiếu SC')) return
                void printPhieuSc(selected[0])
              },
            },
            {
              label: 'In Tem Dán Máy',
              onSelect: () => {
                if (!requireSelection('in tem')) return
                void printTemDanMay(selected[selected.length - 1])
              },
            },
          ]}
        />

        <div className="flex-1" />

        <Button
          size="sm"
          variant="outline"
          className="h-11 md:h-8"
          onClick={() => handleExport()}
        >
          Xuất Excel File
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-11 md:h-8"
          onClick={() => handleExport(true)}
        >
          Xuất Excel In
        </Button>
      </div>

      <BulkActionsBar count={ids.length}>
        <Button
          size="sm"
          variant="outline"
          className="h-11 md:h-8"
          onClick={() => setTransferOpen(true)}
        >
          Chuyển chi nhánh
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-11 gap-1 md:h-8"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="size-4" /> Xóa
        </Button>
      </BulkActionsBar>

      {transferOpen && (
        <TransferBranchModal
          open={transferOpen}
          onOpenChange={setTransferOpen}
          ids={ids}
        />
      )}
      {dispatchPrintOpen && (
        <DispatchTechnicianModal
          open={dispatchPrintOpen}
          onOpenChange={setDispatchPrintOpen}
          ids={ids}
          printAfter
          onPrint={() => printLenhSuaTaiNha(selected)}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn xóa các phiếu sửa chữa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteTickets(ids)
                qc.invalidateQueries({ queryKey: ['repair-list'] })
                notify.success(`Đã xóa ${ids.length} phiếu`)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

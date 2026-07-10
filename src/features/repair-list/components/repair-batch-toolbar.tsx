/**
 * Repair batch toolbar — bulk operations over checked rows plus export/reload.
 * Every selection-required action alerts "Vui lòng chọn phiếu để …" when nothing
 * is checked. In Biên nhận gates on status ≥ Sửa Xong; In Lệnh Sửa Tại Nhà opens
 * "Điều phối in" when checked rows span >1 technician.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PlusCircle, ChevronDown, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { notify } from '@/components/shared'
import { exportToXlsx } from '@/lib/export-xlsx'
import { ROUTES } from '@/constants/routes'
import { STATUS_LABEL, type RepairStatusId } from '@/domains/repair/status'
import { HINH_THUC_LABEL, type RepairTicket } from '@/domains/repair/types'
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
  onReload: () => void
}

const EXPORT_COLUMNS = [
  { header: 'Số phiếu', accessor: (t: RepairTicket) => t.soPhieu },
  { header: 'Khách hàng', accessor: (t: RepairTicket) => t.khachHang.ten },
  { header: 'Điện thoại', accessor: (t: RepairTicket) => t.khachHang.sdt },
  { header: 'Sản phẩm', accessor: (t: RepairTicket) => t.tenSanPham },
  { header: 'Kỹ thuật', accessor: (t: RepairTicket) => t.kyThuat },
  { header: 'Tình trạng', accessor: (t: RepairTicket) => STATUS_LABEL[t.tinhTrang] },
  { header: 'Hình thức', accessor: (t: RepairTicket) => HINH_THUC_LABEL[t.hinhThuc] },
  { header: 'Chi phí dự kiến', accessor: (t: RepairTicket) => t.chiPhiDuKien },
]

export function RepairBatchToolbar({
  selected,
  filters,
  total,
  onReload,
}: RepairBatchToolbarProps) {
  const navigate = useNavigate()
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

  async function handleExport(suffix = '') {
    // Re-fetch the full filtered set (ignore pagination) for the export.
    const res = await fetchRepairList({ ...filters, page: 1, pageSize: total || 1 })
    await exportToXlsx({
      filename: `sua-chua${suffix}`,
      sheetName: 'Sửa chữa',
      columns: EXPORT_COLUMNS,
      rows: res.data,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
        onClick={() => navigate(ROUTES.repairCreate)}
      >
        <PlusCircle className="size-4" />
        Lập phiếu
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() => requireSelection('chuyển chi nhánh') && setTransferOpen(true)}
      >
        Chuyển chi nhánh
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={handleBienNhan}
      >
        In Biên nhận
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          requireSelection('in giấy đi đường') && printGiayDiDuong(selected)
        }
      >
        In Giấy Đi Đường
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={handleLenhSuaTaiNha}
      >
        In Lệnh Sửa Tại Nhà
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() =>
          requireSelection('in phiếu SC') && printPhieuSc(selected[0])
        }
      >
        In Phiếu SC
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600">
            In tem
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              if (!requireSelection('in tem')) return
              void printTemDanMay(selected[selected.length - 1])
            }}
          >
            Dán máy
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="sm"
        variant="destructive"
        className="h-8 gap-1"
        onClick={() => requireSelection('xóa') && setConfirmDelete(true)}
      >
        <Trash2 className="size-4" /> Xóa
      </Button>

      <div className="flex-1" />

      <Button size="sm" variant="outline" className="h-8" onClick={() => handleExport()}>
        Xuất Excel File
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={() => handleExport('-in')}
      >
        Xuất Excel In
      </Button>
      <Button size="sm" variant="ghost" className="h-8" onClick={onReload}>
        Tải lại trang
      </Button>

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

/**
 * Bảng Lương — payroll aggregate view. Emits one row per employee × selected
 * Kỳ, even when no payroll record has been created yet (empty money cells +
 * "Tạo bảng lương" CTA) — this per-employee×kỳ cross product plus a totals
 * second header row aren't expressible through CrudTablePage's single-entity
 * list template, so (like ChamCong/ChamCongTongHop) this page hand-composes
 * DataTable directly over a derived row set.
 */
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMatch } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Printer, FileSpreadsheet, RefreshCw, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { DataTable, DataTableToolbar, notify } from '@/components/shared'
import { formatVND } from '@/lib/format'
import { mockDelay } from '@/lib/mock-delay'
import { ROUTES } from '@/constants/routes'
import { exportToXlsx } from '@/lib/export-xlsx'
import { NHAN_VIEN_ROWS } from '@/mock/masterdata/nhan-vien.mock'
import { PHONG_BAN_ROWS } from '@/mock/masterdata/phong-ban.mock'
import { CHUC_VU_ROWS } from '@/mock/masterdata/chuc-vu.mock'
import { KY, KY_DEFAULT } from '@/mock/seed/ky'
import {
  BANG_LUONG_ROWS,
  findBangLuong,
  createBangLuong,
  computeTongLuong,
  computeThucLanh,
} from '@/domains/hr/bang-luong.mock'
import { printBangLuong } from '@/domains/hr/hr-prints'
import type { BangLuong } from '@/domains/hr/types'

const KY_DESC = [...KY].reverse()

/** Employee×kỳ row, with the payroll record spread in when created (or all
 * money columns left undefined to render the "Tạo bảng lương" empty state). */
interface BangLuongRow {
  id: string
  nhanVienId: string
  kyId: string
  hoTen: string
  phongBan: string
  chucVu: string
  record?: BangLuong
}

function buildRows(kyId: string, hoTenFilter: string, phongBanId: string) {
  return NHAN_VIEN_ROWS.filter((nv) => {
    if (phongBanId && nv.phongBanId !== phongBanId) return false
    if (hoTenFilter && !nv.hoTen.toLowerCase().includes(hoTenFilter.toLowerCase()))
      return false
    return true
  }).map((nv): BangLuongRow => {
    const record = findBangLuong(nv.id, kyId)
    return {
      id: `${nv.id}-${kyId}`,
      nhanVienId: nv.id,
      kyId,
      hoTen: `${nv.maNV} - ${nv.hoTen}`,
      phongBan:
        PHONG_BAN_ROWS.find((p) => p.id === nv.phongBanId)?.tenPhongBan ?? '—',
      chucVu: CHUC_VU_ROWS.find((c) => c.id === nv.chucVuId)?.tenChucVu ?? '—',
      record,
    }
  })
}

// Chức vụ values that get a per-row "Xuất excel" button — reception roles
// (lễ tân) don't, per the verified reference conditionality.
const EXCEL_EXCLUDED_CHUC_VU = new Set(['Nhân viên tiếp nhận'])

export default function BangLuongPage() {
  const match = useMatch(ROUTES.hrPayroll)
  const qc = useQueryClient()
  const [kyId, setKyId] = useState(KY_DEFAULT.id)
  const [hoTen, setHoTen] = useState('')
  const [phongBanId, setPhongBanId] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bang-luong', kyId, hoTen, phongBanId, BANG_LUONG_ROWS.length],
    queryFn: async () => {
      await mockDelay(300, 200)
      return buildRows(kyId, hoTen, phongBanId)
    },
    enabled: match !== null,
    staleTime: 0,
  })

  const rows = data ?? []

  function handleCreate(row: BangLuongRow) {
    createBangLuong(row.nhanVienId, row.kyId)
    notify.success('Đã tạo bảng lương')
    void qc.invalidateQueries({ queryKey: ['bang-luong'] })
  }

  function handlePrint(row: BangLuongRow) {
    if (!row.record) return
    const tongLuong = computeTongLuong(row.record)
    void printBangLuong({
      ...row.record,
      hoTenNV: row.hoTen,
      tenKy: KY.find((k) => k.id === row.kyId)?.ten ?? row.kyId,
      tongLuong,
      thucLanh: computeThucLanh({ ...row.record, tongLuong }),
    })
  }

  const EXPORT_COLUMNS = [
    { header: 'Tên NV', accessor: (r: BangLuongRow) => r.hoTen },
    { header: 'Phòng', accessor: (r: BangLuongRow) => r.phongBan },
    { header: 'Chức vụ', accessor: (r: BangLuongRow) => r.chucVu },
    {
      header: 'Tổng lương',
      accessor: (r: BangLuongRow) =>
        r.record ? computeTongLuong(r.record) : '',
    },
  ]

  async function handleExportAll() {
    await exportToXlsx({
      filename: 'bang-luong',
      sheetName: 'Bảng Lương',
      columns: EXPORT_COLUMNS,
      rows,
    })
  }

  async function handleExportRow(row: BangLuongRow) {
    await exportToXlsx({
      filename: `bang-luong-${row.nhanVienId}`,
      sheetName: 'Bảng Lương',
      columns: EXPORT_COLUMNS,
      rows: [row],
    })
  }

  const columns = useMemo<ColumnDef<BangLuongRow, unknown>[]>(
    () => [
      { id: 'stt', header: 'STT', cell: ({ row }) => row.index + 1, size: 50 },
      {
        id: 'ky',
        header: 'Kỳ',
        size: 90,
        cell: ({ row }) => (
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {KY.find((k) => k.id === row.original.kyId)?.ten ?? row.original.kyId}
          </span>
        ),
      },
      {
        id: 'tenNV',
        header: 'Tên NV',
        size: 200,
        cell: ({ row }) => <span className="font-semibold">{row.original.hoTen}</span>,
      },
      { accessorKey: 'phongBan', header: 'Phòng', size: 130 },
      { accessorKey: 'chucVu', header: 'Chức vụ', size: 170 },
      {
        id: 'luongCung',
        header: 'Lương cứng',
        size: 120,
        cell: ({ row }) =>
          row.original.record ? formatVND(row.original.record.luongCung) : '—',
      },
      {
        id: 'baoHiem',
        header: 'Bảo Hiểm',
        size: 110,
        cell: ({ row }) =>
          row.original.record ? formatVND(row.original.record.baoHiem) : '—',
      },
      {
        id: 'phuCap',
        header: 'Phụ cấp',
        size: 110,
        cell: ({ row }) =>
          row.original.record ? formatVND(row.original.record.phuCap) : '—',
      },
      {
        id: 'tangCaNghi',
        header: 'Tăng ca - Nghỉ',
        size: 150,
        cell: ({ row }) => {
          const r = row.original.record
          if (!r) return '—'
          return (
            <span>
              <span className="text-green-600 dark:text-green-400">
                {formatVND(r.tangCa)}
              </span>
              {' / '}
              <span className="text-red-600 dark:text-red-400">
                {formatVND(r.nghi)}
              </span>
            </span>
          )
        },
      },
      {
        id: 'ungLuong',
        header: 'Ứng lương',
        size: 120,
        cell: ({ row }) =>
          row.original.record ? formatVND(row.original.record.ungLuong) : '—',
      },
      {
        id: 'thuongPhat',
        header: 'Thưởng - Phạt',
        size: 150,
        cell: ({ row }) => {
          const r = row.original.record
          if (!r) return '—'
          return (
            <span>
              <span className="text-green-600 dark:text-green-400">
                {formatVND(r.thuong)}
              </span>
              {' / '}
              <span className="text-red-600 dark:text-red-400">
                {formatVND(r.phat)}
              </span>
            </span>
          )
        },
      },
      {
        id: 'congBH',
        header: 'Công BH',
        size: 110,
        cell: ({ row }) =>
          row.original.record ? formatVND(row.original.record.congBH) : '—',
      },
      {
        id: 'congSC',
        header: 'Công SC',
        size: 110,
        cell: ({ row }) =>
          row.original.record ? formatVND(row.original.record.congSC) : '—',
      },
      {
        id: 'tongLuong',
        header: 'Tổng lương',
        size: 130,
        cell: ({ row }) => {
          const r = row.original.record
          if (!r) return '—'
          return (
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatVND(computeTongLuong(r))}
            </span>
          )
        },
      },
      {
        id: 'thucLanh',
        header: 'Thực lãnh',
        size: 130,
        cell: ({ row }) => {
          const r = row.original.record
          if (!r) return '—'
          const tongLuong = computeTongLuong(r)
          return (
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {formatVND(computeThucLanh({ ...r, tongLuong }))}
            </span>
          )
        },
      },
      {
        id: '_actions',
        header: 'Chọn',
        size: 140,
        cell: ({ row }) => {
          const r = row.original
          if (!r.record) {
            return (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => handleCreate(r)}
              >
                Tạo bảng lương
              </Button>
            )
          }
          const showExcel = !EXCEL_EXCLUDED_CHUC_VU.has(r.chucVu)
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-orange-600"
                title="In"
                onClick={() => handlePrint(r)}
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
              {showExcel && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-green-600"
                  title="Xuất excel"
                  onClick={() => void handleExportRow(r)}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const tongLuongSum = rows.reduce(
    (s, r) => s + (r.record ? computeTongLuong(r.record) : 0),
    0,
  )

  // Totals row (second header row): per-money-column sums across every
  // created payroll record in the current view.
  const totals = rows.reduce(
    (acc, r) => {
      if (!r.record) return acc
      const tongLuong = computeTongLuong(r.record)
      return {
        luongCung: acc.luongCung + r.record.luongCung,
        baoHiem: acc.baoHiem + r.record.baoHiem,
        phuCap: acc.phuCap + r.record.phuCap,
        tangCa: acc.tangCa + r.record.tangCa,
        nghi: acc.nghi + r.record.nghi,
        ungLuong: acc.ungLuong + r.record.ungLuong,
        thuong: acc.thuong + r.record.thuong,
        phat: acc.phat + r.record.phat,
        congBH: acc.congBH + r.record.congBH,
        congSC: acc.congSC + r.record.congSC,
        tongLuong: acc.tongLuong + tongLuong,
        thucLanh: acc.thucLanh + computeThucLanh({ ...r.record, tongLuong }),
      }
    },
    {
      luongCung: 0,
      baoHiem: 0,
      phuCap: 0,
      tangCa: 0,
      nghi: 0,
      ungLuong: 0,
      thuong: 0,
      phat: 0,
      congBH: 0,
      congSC: 0,
      tongLuong: 0,
      thucLanh: 0,
    },
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Bảng Lương</h1>

      <div className="rounded-lg border bg-muted/30 p-3">
        <h2 className="mb-2 text-sm font-medium">Thông tin tìm kiếm</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Kỳ</Label>
            <Select value={kyId} onValueChange={setKyId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KY_DESC.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tên nhân viên</Label>
            <Input
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Tên nhân viên"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phòng ban</Label>
            <Select
              value={phongBanId || '__all__'}
              onValueChange={(v) => setPhongBanId(v === '__all__' ? '' : v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Tất cả phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tất cả</SelectItem>
                {PHONG_BAN_ROWS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.tenPhongBan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" className="h-8" onClick={() => refetch()}>
          Tìm kiếm
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1"
          onClick={() => void handleExportAll()}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Xuất file excel
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1"
          onClick={() => {
            notify.success('Đã cập nhật tiền công KV')
            void refetch()
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Cập nhật tiền công KV
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1"
          onClick={() => refetch()}
        >
          <RotateCw className="h-4 w-4" />
          Tải lại trang
        </Button>
        <div className="ml-auto text-sm font-medium">
          Tổng lương: {formatVND(tongLuongSum)}
        </div>
      </div>

      {/* Totals second header row — per-money-column sums, rendered as a
          compact standalone strip above the main table (DataTable itself
          doesn't support a second header row). */}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-muted/40">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-[50px]" />
                <TableCell className="w-[90px]" />
                <TableCell className="font-semibold">Tổng</TableCell>
                <TableCell className="w-[130px]" />
                <TableCell className="w-[170px]" />
                <TableCell className="w-[120px] tabular-nums">
                  {formatVND(totals.luongCung)}
                </TableCell>
                <TableCell className="w-[110px] tabular-nums">
                  {formatVND(totals.baoHiem)}
                </TableCell>
                <TableCell className="w-[110px] tabular-nums">
                  {formatVND(totals.phuCap)}
                </TableCell>
                <TableCell className="w-[150px] tabular-nums">
                  <span className="text-green-600 dark:text-green-400">
                    {formatVND(totals.tangCa)}
                  </span>
                  {' / '}
                  <span className="text-red-600 dark:text-red-400">
                    {formatVND(totals.nghi)}
                  </span>
                </TableCell>
                <TableCell className="w-[120px] tabular-nums">
                  {formatVND(totals.ungLuong)}
                </TableCell>
                <TableCell className="w-[150px] tabular-nums">
                  <span className="text-green-600 dark:text-green-400">
                    {formatVND(totals.thuong)}
                  </span>
                  {' / '}
                  <span className="text-red-600 dark:text-red-400">
                    {formatVND(totals.phat)}
                  </span>
                </TableCell>
                <TableCell className="w-[110px] tabular-nums">
                  {formatVND(totals.congBH)}
                </TableCell>
                <TableCell className="w-[110px] tabular-nums">
                  {formatVND(totals.congSC)}
                </TableCell>
                <TableCell className="w-[130px] font-bold tabular-nums text-green-600 dark:text-green-400">
                  {formatVND(totals.tongLuong)}
                </TableCell>
                <TableCell className="w-[130px] font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {formatVND(totals.thucLanh)}
                </TableCell>
                <TableCell className="w-[140px]" />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <DataTable
        tableId="bang-luong"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="Chưa có dữ liệu bảng lương"
        toolbar={<DataTableToolbar />}
      />
    </div>
  )
}

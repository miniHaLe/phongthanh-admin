/**
 * Chấm Công Tổng Hợp — per-employee, per-Kỳ totals aggregated from the
 * Chấm Công exception records (replacing the previous invented day-1..26
 * X/M/P/V matrix). Aggregate/matrix-adjacent view, not a single-entity list
 * — hand-composed like BangLuongPage/ChamCongPage.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMatch } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTable, DataTableToolbar } from '@/components/shared'
import { formatDate } from '@/lib/format'
import { mockDelay } from '@/lib/mock-delay'
import { exportToXlsx } from '@/lib/export-xlsx'
import { ROUTES } from '@/constants/routes'
import { NHAN_VIEN_ROWS } from '@/mock/masterdata/nhan-vien.mock'
import { KY, KY_DEFAULT } from '@/mock/seed/ky'
import { LOAI_CHAM } from '@/mock/seed/cham-cong'
import { CHAM_CONG_RECORD_ROWS } from '@/domains/hr/cham-cong.mock'
import type { ChamCongRecord } from '@/domains/hr/types'
import { useLookup } from '@/hooks/use-lookup'
import type { ChiNhanh } from '@/types/masterdata-types'

const KY_DESC = [...KY].reverse()

interface TongHopRow {
  id: string
  maNV: string
  hoTen: string
  chiNhanh: string
  ngayChamCong: string | undefined
  ngayNghi: number
  gioTangCa: number
  soGioTre: number
  gioVeSom: number
  records: ChamCongRecord[]
}

function aggregate(
  kyId: string,
  hoTenFilter: string,
  chiNhanhById: Map<string, ChiNhanh>,
): TongHopRow[] {
  return NHAN_VIEN_ROWS.filter(
    (nv) =>
      !hoTenFilter ||
      nv.hoTen.toLowerCase().includes(hoTenFilter.toLowerCase()),
  )
    .map((nv): TongHopRow => {
      const records = CHAM_CONG_RECORD_ROWS.filter(
        (r) => r.nhanVienId === nv.id && r.kyId === kyId,
      )
      const ngayNghi = records
        .filter((r) => r.loaiCham === 1 || r.loaiCham === 2)
        .reduce(
          (s, r) => s + (r.loaiCham === 2 ? r.soLuong * 0.5 : r.soLuong),
          0,
        )
      const gioTangCa = records
        .filter((r) => r.loaiCham === 4)
        .reduce((s, r) => s + r.soLuong, 0)
      const soGioTre = records
        .filter((r) => r.loaiCham === 3)
        .reduce((s, r) => s + r.soLuong, 0)
      const gioVeSom = records
        .filter((r) => r.loaiCham === 5)
        .reduce((s, r) => s + r.soLuong, 0)
      const lastRecord = [...records].sort((a, b) =>
        a.ngayCham < b.ngayCham ? 1 : -1,
      )[0]
      return {
        id: nv.id,
        maNV: nv.maNV,
        hoTen: nv.hoTen,
        chiNhanh: chiNhanhById.get(nv.chiNhanhId)?.tenChiNhanh ?? '—',
        ngayChamCong: lastRecord?.ngayCham,
        ngayNghi,
        gioTangCa,
        soGioTre,
        gioVeSom,
        records,
      }
    })
    .filter((r) => r.records.length > 0)
}

export default function ChamCongTongHopPage() {
  const match = useMatch(ROUTES.hrAttendanceSummary)
  const chiNhanhLookup = useLookup('chi-nhanh')
  const [kyId, setKyId] = useState(KY_DEFAULT.id)
  const [hoTen, setHoTen] = useState('')
  const [detailRow, setDetailRow] = useState<TongHopRow | undefined>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cham-cong-tong-hop', kyId, hoTen, chiNhanhLookup.dataUpdatedAt],
    queryFn: async () => {
      await mockDelay(300, 200)
      return aggregate(kyId, hoTen, chiNhanhLookup.byId)
    },
    enabled: match !== null && !chiNhanhLookup.isLoading,
    staleTime: 0,
  })

  const rows = data ?? []

  async function handleExport() {
    await exportToXlsx({
      filename: 'cham-cong-tong-hop',
      sheetName: 'Chấm Công Tổng Hợp',
      columns: [
        { header: 'Mã NV', accessor: (r: TongHopRow) => r.maNV },
        { header: 'Tên NV', accessor: (r: TongHopRow) => r.hoTen },
        { header: 'Chi nhánh', accessor: (r: TongHopRow) => r.chiNhanh },
        { header: 'Ngày nghỉ', accessor: (r: TongHopRow) => r.ngayNghi },
        { header: 'Giờ tăng ca', accessor: (r: TongHopRow) => r.gioTangCa },
        { header: 'Số giờ trễ', accessor: (r: TongHopRow) => r.soGioTre },
        { header: 'Giờ về sớm', accessor: (r: TongHopRow) => r.gioVeSom },
      ],
      rows,
    })
  }

  const columns = useMemo<ColumnDef<TongHopRow, unknown>[]>(
    () => [
      { id: 'stt', header: 'STT', cell: ({ row }) => row.index + 1, size: 50 },
      { accessorKey: 'maNV', header: 'Mã NV', size: 90 },
      { accessorKey: 'hoTen', header: 'Tên NV', size: 180 },
      { accessorKey: 'chiNhanh', header: 'Chi nhánh', size: 150 },
      {
        id: 'ngayChamCong',
        header: 'Ngày chấm công',
        size: 130,
        cell: ({ row }) => formatDate(row.original.ngayChamCong),
      },
      { accessorKey: 'ngayNghi', header: 'Ngày nghỉ', size: 100 },
      { accessorKey: 'gioTangCa', header: 'Giờ tăng ca', size: 110 },
      { accessorKey: 'soGioTre', header: 'Số giờ trễ', size: 100 },
      { accessorKey: 'gioVeSom', header: 'Giờ về sớm', size: 110 },
      {
        id: 'xem',
        header: 'Xem',
        size: 70,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Xem chi tiết"
            onClick={() => setDetailRow(row.original)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Chấm Công Tổng Hợp</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Kỳ</label>
          <Select value={kyId} onValueChange={setKyId}>
            <SelectTrigger className="h-8 w-40 text-sm">
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
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => refetch()}
        >
          Tìm kiếm
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => void handleExport()}
        >
          Xuất Excel
        </Button>
      </div>

      <DataTable
        tableId="cham-cong-tong-hop"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="Chưa có dữ liệu chấm công tổng hợp"
        toolbar={
          <DataTableToolbar
            searchValue={hoTen}
            onSearchChange={setHoTen}
            searchPlaceholder="Tên Nhân Viên…"
          />
        }
      />

      <Dialog
        open={detailRow !== undefined}
        onOpenChange={(o) => !o && setDetailRow(undefined)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết chấm công — {detailRow?.hoTen}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày chấm công</TableHead>
                <TableHead>Loại chấm</TableHead>
                <TableHead>Số lượng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(detailRow?.records ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDate(r.ngayCham)}</TableCell>
                  <TableCell>
                    {LOAI_CHAM.find((l) => l.id === r.loaiCham)?.ten ??
                      r.loaiCham}
                  </TableCell>
                  <TableCell>
                    {r.soLuong} ({r.donVi})
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * ThuChiPage (Chứng Từ) — hand-composed page-level DataTable (not
 * CrudTablePage) per the reference: 15-column table, 4 KPI boxes, dual
 * Lập Phiếu Thu/Chi create modals, print-only row action, dual Excel export,
 * bulk-select. Route: /tai-chinh/thu-chi
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { isWithinInterval, parseISO, subDays } from 'date-fns'
import type { RowSelectionState } from '@tanstack/react-table'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  PageHeader,
  BulkActionsBar,
  StatCard,
  notify,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { FilterPanel } from '@/components/shared'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { thuChiApi, THU_CHI_ROWS } from '@/mock/finance-mock'
import { formatVND, formatDateTime } from '@/lib/format'
import { exportToXlsx } from '@/lib/export-xlsx'
import { openPrintWindow } from '@/components/print/print-window'
import { PrintLayout } from '@/components/print/print-layout'
import { LapPhieuThuModal } from '@/features/finance/lap-phieu-thu-modal'
import { LapPhieuChiModal } from '@/features/finance/lap-phieu-chi-modal'
import { useThuChiCompositeColumns } from '@/features/finance/thu-chi-composite-table-columns'
import {
  LOAI_THU_CHI_FILTER_OPTIONS,
  TINH_TRANG_FILTER_OPTIONS,
  HINH_THUC_FILTER_OPTIONS,
  BRANCH_FILTER_OPTIONS,
  LOAI_NGAY_OPTIONS,
  isThuType,
  loaiThuChiLabel,
  type LoaiNgay,
} from '@/config/finance-tables/thu-chi.config'
import type { ThuChi } from '@/types/finance-types'

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]
const DEFAULT_PAGE_SIZE = 20
const TABLE_ID = 'thu-chi'

interface ThuChiFilters {
  branchId?: string
  tinhTrang?: string
  hinhThucId?: string
  loaiThuChi?: string
  soChungTu?: string
  tenKhachHang?: string
  noiDung?: string
  loaiNgay: LoaiNgay
  dateFrom?: string
  dateTo?: string
}

const DEFAULT_FILTERS: ThuChiFilters = {
  loaiNgay: 'ngay_lap',
  dateFrom: subDays(new Date(), 30).toISOString().slice(0, 10),
  dateTo: new Date().toISOString().slice(0, 10),
}

function applyFilters(rows: ThuChi[], f: ThuChiFilters): ThuChi[] {
  let out = rows
  if (f.branchId) out = out.filter((r) => r.branchId === f.branchId)
  if (f.tinhTrang) out = out.filter((r) => String(r.tinhTrang) === f.tinhTrang)
  if (f.hinhThucId) out = out.filter((r) => String(r.hinhThucId) === f.hinhThucId)
  if (f.loaiThuChi) out = out.filter((r) => String(r.loaiThuChi) === f.loaiThuChi)
  if (f.soChungTu) {
    const q = f.soChungTu.toLowerCase()
    out = out.filter((r) => r.soChungTu.toLowerCase().includes(q))
  }
  if (f.tenKhachHang) {
    const q = f.tenKhachHang.toLowerCase()
    out = out.filter((r) => r.tenKhachHang.toLowerCase().includes(q))
  }
  if (f.noiDung) {
    const q = f.noiDung.toLowerCase()
    out = out.filter((r) => r.noiDung.toLowerCase().includes(q))
  }
  if (f.dateFrom || f.dateTo) {
    const from = f.dateFrom ? parseISO(f.dateFrom) : new Date(0)
    const to = f.dateTo ? parseISO(f.dateTo) : new Date(8640000000000000)
    out = out.filter((r) => {
      const dateField = f.loaiNgay === 'ngay_lap' ? r.ngayLap : r.ngayThuChi
      if (!dateField) return false
      try {
        return isWithinInterval(parseISO(dateField), { start: from, end: to })
      } catch {
        return false
      }
    })
  }
  return out
}

function printPhieuThuChi(row: ThuChi) {
  const isThu = isThuType(row.loaiThuChi)
  return openPrintWindow(
    isThu ? 'Phiếu Thu' : 'Phiếu Chi',
    <PrintLayout
      title={isThu ? 'PHIẾU THU' : 'PHIẾU CHI'}
      signatures={['Người lập', isThu ? 'Người nộp' : 'Người nhận']}
    >
      <table>
        <tbody>
          <tr>
            <td>Số chứng từ</td>
            <td>{row.soChungTu}</td>
          </tr>
          <tr>
            <td>Loại phiếu</td>
            <td>{loaiThuChiLabel(row.loaiThuChi)}</td>
          </tr>
          <tr>
            <td>{isThu ? 'Người nộp' : 'Người nhận'}</td>
            <td>{row.tenKhachHang}</td>
          </tr>
          <tr>
            <td>Số tiền</td>
            <td>{formatVND(row.soTien)}</td>
          </tr>
          <tr>
            <td>Nội dung</td>
            <td>{row.noiDung}</td>
          </tr>
          <tr>
            <td>Ngày lập</td>
            <td>{formatDateTime(row.ngayLap)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export default function ThuChiPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ThuChiFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [phieuThuOpen, setPhieuThuOpen] = useState(false)
  const [phieuChiOpen, setPhieuChiOpen] = useState(false)

  const commands = useMemo(
    () => [
      {
        id: 'nav-thu-chi',
        label: 'Mở Chứng Từ',
        group: 'Tài chính & Kho',
        keywords: ['thu chi', 'tai chinh', 'chung tu'],
        run: () => navigate(ROUTES.financeTransactions),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-thu-chi', commands)

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['thu-chi-list', filters],
    queryFn: async () => {
      // Read straight from the live store — thuChiApi.list applies its own
      // generic search/sort, but the reference filter set (date-type radio,
      // Số phiếu SC/hãng, …) is bespoke enough to filter client-side here,
      // same pattern as BanHangPage's applyClientFilters.
      await thuChiApi.list({ page: 1, pageSize: THU_CHI_ROWS.length })
      return applyFilters(THU_CHI_ROWS, filters)
    },
    placeholderData: keepPreviousData,
  })

  const filteredRows = useMemo(() => data ?? [], [data])
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // KPI boxes are search-scoped (recomputed from the current filtered result,
  // not a separate period query) per the verified reference.
  const kpi = useMemo(() => {
    let doanhThu = 0
    let doanhThuNgoai = 0
    let phaiThu = 0
    let chiPhi = 0
    let phaiTra = 0
    for (const r of filteredRows) {
      if (r.tinhTrang === 2) doanhThu += r.soTien
      else if (r.tinhTrang === 5) doanhThuNgoai += r.soTien
      else if (r.tinhTrang === 1) phaiThu += r.soTien
      else if (r.tinhTrang === 4) chiPhi += r.soTien
      else if (r.tinhTrang === 3) phaiTra += r.soTien
    }
    return { doanhThu, doanhThuNgoai, phaiThu, chiPhi, phaiTra }
  }, [filteredRows])

  function handleFilterChange(patch: Partial<ThuChiFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'loaiNgay' && v != null && v !== '',
  ).length

  async function handleExport(scOnly: boolean) {
    const rows = scOnly ? filteredRows.filter((r) => r.loaiThuChi === 3) : filteredRows
    await exportToXlsx({
      filename: scOnly ? 'thu-chi-thu-sc' : 'thu-chi',
      sheetName: 'Chứng Từ',
      columns: [
        { header: 'Số chứng từ', accessor: (r: ThuChi) => r.soChungTu },
        { header: 'Loại phiếu', accessor: (r: ThuChi) => loaiThuChiLabel(r.loaiThuChi) },
        { header: 'Tên khách hàng', accessor: (r: ThuChi) => r.tenKhachHang },
        { header: 'Số tiền', accessor: (r: ThuChi) => r.soTien },
        { header: 'Ngày lập', accessor: (r: ThuChi) => r.ngayLap },
      ],
      rows,
    })
  }

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const columns = useThuChiCompositeColumns(printPhieuThuChi)

  return (
    <div className="space-y-0">
      <PageHeader
        title="Chứng Từ"
        breadcrumbs={[{ label: 'Tài Chính', href: ROUTES.finance }, { label: 'Chứng Từ' }]}
      >
        <Button size="sm" className="h-8" onClick={() => setPhieuThuOpen(true)}>
          Lập Phiếu Thu
        </Button>
        <Button size="sm" variant="outline" className="h-8" onClick={() => setPhieuChiOpen(true)}>
          Lập Phiếu Chi
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Doanh thu / Doanh thu ngoài"
            value={`${formatVND(kpi.doanhThu)} / ${formatVND(kpi.doanhThuNgoai)}`}
            className="border-l-4 border-l-emerald-500"
          />
          <StatCard
            label="Phải thu"
            value={formatVND(kpi.phaiThu)}
            className="border-l-4 border-l-blue-500"
          />
          <StatCard
            label="Chi phí"
            value={formatVND(kpi.chiPhi)}
            className="border-l-4 border-l-amber-500"
          />
          <StatCard
            label="Phải trả"
            value={formatVND(kpi.phaiTra)}
            className="border-l-4 border-l-rose-500"
          />
        </div>

        <FilterPanel filterCount={activeFilterCount} onClear={() => setFilters(DEFAULT_FILTERS)}>
          <Select
            value={filters.branchId ?? '__all__'}
            onValueChange={(v) => handleFilterChange({ branchId: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger aria-label="Chi nhánh">
              <SelectValue placeholder="Chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả chi nhánh</SelectItem>
              {BRANCH_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.tinhTrang ?? '__all__'}
            onValueChange={(v) => handleFilterChange({ tinhTrang: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger aria-label="Tình trạng">
              <SelectValue placeholder="Tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả tình trạng</SelectItem>
              {TINH_TRANG_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.hinhThucId ?? '__all__'}
            onValueChange={(v) => handleFilterChange({ hinhThucId: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger aria-label="Hình thức thu">
              <SelectValue placeholder="Hình thức thu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả hình thức</SelectItem>
              {HINH_THUC_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.loaiThuChi ?? '__all__'}
            onValueChange={(v) => handleFilterChange({ loaiThuChi: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger aria-label="Loại thu chi">
              <SelectValue placeholder="Loại thu chi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả loại</SelectItem>
              {LOAI_THU_CHI_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Số chứng từ"
            value={filters.soChungTu ?? ''}
            onChange={(e) => handleFilterChange({ soChungTu: e.target.value || undefined })}
          />

          <Input
            placeholder="Tên khách hàng/ điện thoại"
            value={filters.tenKhachHang ?? ''}
            onChange={(e) => handleFilterChange({ tenKhachHang: e.target.value || undefined })}
          />

          <Input
            placeholder="Nội dung"
            value={filters.noiDung ?? ''}
            onChange={(e) => handleFilterChange({ noiDung: e.target.value || undefined })}
          />

          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Loại ngày:</Label>
            <RadioGroup
              value={filters.loaiNgay}
              onValueChange={(v) => handleFilterChange({ loaiNgay: v as LoaiNgay })}
              className="flex items-center gap-3"
            >
              {LOAI_NGAY_OPTIONS.map((o) => (
                <div key={o.value} className="flex items-center gap-1.5">
                  <RadioGroupItem value={o.value} id={`loai-ngay-${o.value}`} />
                  <Label htmlFor={`loai-ngay-${o.value}`} className="text-xs font-normal">
                    {o.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
            <Input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(e) => handleFilterChange({ dateFrom: e.target.value || undefined })}
              aria-label="Từ ngày"
            />
            <span className="hidden text-center text-muted-foreground sm:block">–</span>
            <Input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(e) => handleFilterChange({ dateTo: e.target.value || undefined })}
              aria-label="Đến ngày"
            />
          </div>
        </FilterPanel>

        <BulkActionsBar count={selectedIds.length}>
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => {
              for (const id of selectedIds) {
                const idx = THU_CHI_ROWS.findIndex((r) => r.id === id)
                if (idx !== -1) THU_CHI_ROWS.splice(idx, 1)
              }
              setRowSelection({})
              notify.success(`Đã xóa ${selectedIds.length} dòng`)
              void refetch()
            }}
          >
            Xóa
          </Button>
        </BulkActionsBar>

        <DataTable
          tableId={TABLE_ID}
          columns={columns}
          data={pageRows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có chứng từ nào"
          manualPagination
          pagination={{ pageIndex: page - 1, pageSize }}
          pageCount={totalPages}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(r) => r.id}
          scrollLabel="Bảng thu chi"
          tableMinWidth={1560}
          tableLayout="content-safe"
          toolbar={
            <DataTableToolbar
              right={
                <div className={isFetching ? 'opacity-60' : ''}>
                  <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => void handleExport(false)}>
                    Xuất ra Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 h-8 gap-1"
                    onClick={() => void handleExport(true)}
                  >
                    Xuất ra Excel Thu SC
                  </Button>
                </div>
              }
            />
          }
        />

        {!isError && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s)
              setPage(1)
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        )}
      </div>

      <LapPhieuThuModal
        open={phieuThuOpen}
        onOpenChange={setPhieuThuOpen}
        onCreated={() => void refetch()}
      />
      <LapPhieuChiModal
        open={phieuChiOpen}
        onOpenChange={setPhieuChiOpen}
        onCreated={() => void refetch()}
      />
    </div>
  )
}

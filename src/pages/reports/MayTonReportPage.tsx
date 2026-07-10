/**
 * Báo cáo máy tồn (Phase 7 — owned exclusively).
 * Stagnant/unreturned-machine list: tickets not yet handed back to the
 * customer (open statuses per OPEN_STATUS_IDS) within the selected period.
 * Filters: Chi nhánh + Day/Month/Year tri-mode (via shared PeriodModeFilter).
 */
import { useMemo, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Loader2, Search, FileSpreadsheet } from 'lucide-react'
import { PageHeader } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PeriodModeFilter } from '@/components/reports/period-mode-filter'
import { ReportResultsTable } from '@/components/reports/report-results-table'
import { ReportEmptyState } from '@/components/reports/report-empty-state'
import { DataTablePagination } from '@/components/shared'
import { BRANCHES, BRANCH_NAME, type BranchId } from '@/mock/seed/branches'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { OPEN_STATUS_IDS, STATUS_LABEL } from '@/domains/repair/status'
import { formatDate } from '@/lib/format'
import { mockDelay } from '@/lib/mock-delay'
import { exportToXlsx } from '@/lib/export-xlsx'
import type { ColumnDef } from '@tanstack/react-table'
import type { PeriodMode, ReportRow } from '@/mock/reports/report-types'
import type { RepairTicket } from '@/domains/repair/types'

// ── Filter schema (period fields optional — active mode validated below) ────

const filterSchema = z.object({
  mode: z.enum(['ngay', 'thang', 'nam']),
  chiNhanh: z.string().default('all'),
  tuNgay: z.string().optional(),
  denNgay: z.string().optional(),
  nam: z.coerce.number().int().min(2000).max(2100).optional(),
  tuThang: z.coerce.number().int().min(1).max(12).optional(),
  denThang: z.coerce.number().int().min(1).max(12).optional(),
  tuNam: z.coerce.number().int().min(2000).max(2100).optional(),
  denNam: z.coerce.number().int().min(2000).max(2100).optional(),
})

type FilterValues = z.infer<typeof filterSchema>

function defaultValues(): FilterValues {
  const today = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 1)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const currentYear = today.getFullYear()
  return {
    mode: 'ngay',
    chiNhanh: 'all',
    tuNgay: from.toISOString().slice(0, 10),
    denNgay: tomorrow.toISOString().slice(0, 10),
    nam: currentYear,
    tuThang: 1,
    denThang: 12,
    tuNam: currentYear - 1,
    denNam: currentYear,
  }
}

/** Resolve a filter's period mode + fields into a millisecond [from, to] range. */
function resolveRangeMs(values: FilterValues): [number, number] {
  if (values.mode === 'thang') {
    const year = values.nam ?? new Date().getFullYear()
    const fromM = values.tuThang ?? 1
    const toM = values.denThang ?? 12
    const from = new Date(year, fromM - 1, 1).getTime()
    const to = new Date(year, toM, 0, 23, 59, 59, 999).getTime()
    return [from, to]
  }
  if (values.mode === 'nam') {
    const fromY = values.tuNam ?? new Date().getFullYear() - 1
    const toY = values.denNam ?? new Date().getFullYear()
    const from = new Date(fromY, 0, 1).getTime()
    const to = new Date(toY, 11, 31, 23, 59, 59, 999).getTime()
    return [from, to]
  }
  // ngay
  const from = values.tuNgay ? new Date(values.tuNgay).getTime() : 0
  const to = values.denNgay
    ? new Date(values.denNgay).getTime() + 86_400_000 - 1
    : Date.now()
  return [from, to]
}

type StagnantRow = ReportRow

function toStagnantRow(t: RepairTicket): StagnantRow {
  return {
    soPhieu: t.soPhieu,
    ngayNhan: t.ngayNhan,
    khachHang: t.khachHang.ten,
    thietBi: t.tenSanPham,
    kyThuat: t.kyThuat,
    chiNhanh: BRANCH_NAME[t.branchId as BranchId] ?? t.branchId,
    trangThai: STATUS_LABEL[t.tinhTrang],
  }
}

async function fetchStagnantMachines(
  values: FilterValues,
): Promise<StagnantRow[]> {
  await mockDelay(200, 150)
  const [fromMs, toMs] = resolveRangeMs(values)
  const openSet = new Set<number>(OPEN_STATUS_IDS)

  return MOCK_TICKETS.filter((t) => {
    if (!openSet.has(t.tinhTrang)) return false
    if (values.chiNhanh !== 'all' && t.branchId !== values.chiNhanh)
      return false
    const nhanMs = new Date(t.ngayNhan).getTime()
    return nhanMs >= fromMs && nhanMs <= toMs
  }).map(toStagnantRow)
}

const COLUMNS: ColumnDef<StagnantRow>[] = [
  { accessorKey: 'soPhieu', header: 'Số phiếu' },
  {
    accessorKey: 'ngayNhan',
    header: 'Ngày nhận',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  { accessorKey: 'khachHang', header: 'Khách hàng' },
  { accessorKey: 'thietBi', header: 'Thiết bị' },
  { accessorKey: 'kyThuat', header: 'Kỹ thuật' },
  { accessorKey: 'chiNhanh', header: 'Chi nhánh' },
  { accessorKey: 'trangThai', header: 'Tình trạng' },
]

const EXPORT_COLUMNS = [
  { header: 'Số phiếu', accessor: (r: StagnantRow) => r.soPhieu },
  { header: 'Ngày nhận', accessor: (r: StagnantRow) => formatDate(r.ngayNhan as string) },
  { header: 'Khách hàng', accessor: (r: StagnantRow) => r.khachHang },
  { header: 'Thiết bị', accessor: (r: StagnantRow) => r.thietBi },
  { header: 'Kỹ thuật', accessor: (r: StagnantRow) => r.kyThuat },
  { header: 'Chi nhánh', accessor: (r: StagnantRow) => r.chiNhanh },
  { header: 'Tình trạng', accessor: (r: StagnantRow) => r.trangThai },
]

const PAGE_SIZE = 25

export default function MayTonReportPage() {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultValues(),
  })
  const [mode, setMode] = useState<PeriodMode>('ngay')
  const [hasRun, setHasRun] = useState(false)
  const [submitted, setSubmitted] = useState<FilterValues | null>(null)
  const [page, setPage] = useState(1)

  const { data, isFetching } = useQuery({
    queryKey: ['may-ton-report', submitted],
    queryFn: () => fetchStagnantMachines(submitted!),
    enabled: hasRun && submitted !== null,
  })

  function handleSearch(values: FilterValues) {
    setSubmitted({ ...values, mode })
    setHasRun(true)
    setPage(1)
  }

  const rows = useMemo(() => data ?? [], [data])
  const pagedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  )

  async function handleExport() {
    await exportToXlsx({
      filename: 'bao-cao-may-ton.xlsx',
      sheetName: 'Báo cáo máy tồn',
      columns: EXPORT_COLUMNS,
      rows,
    })
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="Báo cáo máy tồn"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Báo Cáo', href: ROUTES.reports },
          { label: 'Máy tồn' },
        ]}
      />

      <div className="space-y-4 p-6">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSearch)}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="mb-4 max-w-xs space-y-1.5">
              <Label htmlFor="may-ton-chi-nhanh">Chi nhánh</Label>
              <Select
                value={form.watch('chiNhanh')}
                onValueChange={(v) => form.setValue('chiNhanh', v)}
              >
                <SelectTrigger id="may-ton-chi-nhanh" aria-label="Chi nhánh">
                  <SelectValue placeholder="Tất cả chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <PeriodModeFilter mode={mode} onModeChange={setMode} />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={isFetching} className="gap-1.5">
                {isFetching ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="size-4" aria-hidden="true" />
                )}
                {isFetching ? 'Đang tải…' : 'Tìm kiếm'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={handleExport}
              >
                <FileSpreadsheet className="size-4" aria-hidden="true" />
                Xuất Excel File
              </Button>
            </div>
          </form>
        </FormProvider>

        {!hasRun && <ReportEmptyState hasRun={false} />}

        {hasRun && (
          <>
            <ReportResultsTable
              columns={COLUMNS}
              data={pagedRows}
              isLoading={isFetching}
            />
            {rows.length > 0 && (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                total={rows.length}
                onPageChange={setPage}
                onPageSizeChange={() => {}}
                pageSizeOptions={[PAGE_SIZE]}
              />
            )}
            {!isFetching && rows.length === 0 && (
              <ReportEmptyState hasRun={true} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

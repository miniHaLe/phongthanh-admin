import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { FileSpreadsheet, Loader2, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared'
import {
  AgingPivotTable,
  type AgingPivotColumn,
} from '@/components/reports/aging-pivot-table'
import { PeriodModeFilter } from '@/components/reports/period-mode-filter'
import { ReportDrilldown } from '@/components/reports/report-drilldown'
import { ReportEmptyState } from '@/components/reports/report-empty-state'
import { ReportLoadingState } from '@/components/reports/report-loading-state'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/constants/routes'
import {
  computeMayTonAging,
  resolveReportPeriodBounds,
  selectMayTonDrilldownTickets,
  type MayTonAgingOptions,
  type MayTonAgingRow,
  type MayTonCellKey,
} from '@/domains/reports/aging-buckets'
import {
  MOCK_TICKETS,
  REPAIR_MOCK_REFERENCE_EPOCH_MS,
} from '@/domains/repair/mock-data'
import type { RepairTicket } from '@/domains/repair/types'
import { exportToXlsx, type ExportColumn } from '@/lib/export-xlsx'
import { BRANCHES } from '@/mock/seed/branches'
import type { PeriodMode } from '@/mock/reports/report-types'

const REPORT_REFERENCE_DATE = new Date(REPAIR_MOCK_REFERENCE_EPOCH_MS)
const REPORT_REFERENCE_ISO = REPORT_REFERENCE_DATE.toISOString()

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
  const from = new Date(REPORT_REFERENCE_DATE)
  from.setMonth(from.getMonth() - 1)
  const tomorrow = new Date(REPORT_REFERENCE_DATE)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const currentYear = REPORT_REFERENCE_DATE.getFullYear()
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

const MAY_TON_COLUMNS: readonly AgingPivotColumn<MayTonAgingRow>[] = [
  { key: 'total', label: 'Tổng', getValue: (row) => row.total },
  { key: 'day1', label: '1', getValue: (row) => row.day1 },
  { key: 'day3', label: '3', getValue: (row) => row.day3 },
  { key: 'day7', label: '7', getValue: (row) => row.day7 },
  { key: 'day14', label: '14', getValue: (row) => row.day14 },
  { key: 'day21', label: '21', getValue: (row) => row.day21 },
  { key: 'day30', label: '30', getValue: (row) => row.day30 },
  { key: 'day31Plus', label: '>=31', getValue: (row) => row.day31Plus },
]

function exportColumns(
  rows: readonly MayTonAgingRow[],
): ExportColumn<MayTonAgingRow>[] {
  return [
    { header: 'STT', accessor: (row) => rows.indexOf(row) + 1 },
    { header: 'Tình trạng', accessor: (row) => row.statusLabel },
    ...MAY_TON_COLUMNS.map((column) => ({
      header: column.label,
      accessor: column.getValue,
    })),
  ]
}

interface QueryResult {
  rows: MayTonAgingRow[]
  options: MayTonAgingOptions
}

interface DrilldownSelection {
  title: string
  tickets: RepairTicket[]
}

export default function MayTonReportPage() {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultValues(),
  })
  const [mode, setMode] = useState<PeriodMode>('ngay')
  const [hasRun, setHasRun] = useState(false)
  const [submitted, setSubmitted] = useState<FilterValues | null>(null)
  const [drilldown, setDrilldown] = useState<DrilldownSelection | null>(null)

  const { data, isFetching } = useQuery<QueryResult>({
    queryKey: ['may-ton-report', submitted],
    queryFn: () => {
      const period = resolveReportPeriodBounds(
        submitted!,
        REPORT_REFERENCE_DATE,
      )
      const options: MayTonAgingOptions = {
        ...period,
        branchId:
          submitted!.chiNhanh === 'all' ? undefined : submitted!.chiNhanh,
      }
      return Promise.resolve({
        rows: computeMayTonAging(MOCK_TICKETS, REPORT_REFERENCE_ISO, options),
        options,
      })
    },
    enabled: hasRun && submitted !== null,
  })

  function handleModeChange(next: PeriodMode) {
    setMode(next)
    form.setValue('mode', next)
  }

  function handleSearch(values: FilterValues) {
    setSubmitted({ ...values, mode })
    setHasRun(true)
    setDrilldown(null)
  }

  function handleCellClick(row: MayTonAgingRow, columnKey: string) {
    if (!data) return
    const bucket = columnKey as MayTonCellKey
    const columnLabel = MAY_TON_COLUMNS.find(
      (column) => column.key === columnKey,
    )?.label
    setDrilldown({
      title: `Danh sách phiếu — ${row.statusLabel} / ${columnLabel}`,
      tickets: selectMayTonDrilldownTickets(
        MOCK_TICKETS,
        REPORT_REFERENCE_ISO,
        { ...data.options, statusId: row.statusId, bucket },
      ),
    })
  }

  const rows = data?.rows ?? []

  function handleExport() {
    void exportToXlsx({
      filename: 'bao-cao-may-ton.xlsx',
      sheetName: 'Báo cáo máy tồn',
      columns: exportColumns(rows),
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
                onValueChange={(value) => form.setValue('chiNhanh', value)}
              >
                <SelectTrigger id="may-ton-chi-nhanh" aria-label="Chi nhánh">
                  <SelectValue placeholder="Tất cả chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <PeriodModeFilter mode={mode} onModeChange={handleModeChange} />

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
        {hasRun && isFetching && <ReportLoadingState rows={15} cols={10} />}
        {hasRun && !isFetching && data && (
          <AgingPivotTable
            rows={rows}
            rowHeader="Tình trạng"
            getRowId={(row) => row.statusId}
            getRowLabel={(row) => row.statusLabel}
            columns={MAY_TON_COLUMNS}
            onCellClick={handleCellClick}
          />
        )}
        {drilldown && (
          <ReportDrilldown
            title={drilldown.title}
            tickets={drilldown.tickets}
          />
        )}
      </div>
    </div>
  )
}

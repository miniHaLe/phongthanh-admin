/**
 * Báo cáo KPI Tiếp nhận (Phase 7 — owned exclusively).
 * Same layout as KPI Kỹ thuật (R4) but the multi-select targets the
 * receptionist pool ("Tất cả tiếp nhận") instead of technicians, and only a
 * single "Xuất Excel File" export is offered (no Lương / 1 Ngày variants).
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PeriodModeFilter } from '@/components/reports/period-mode-filter'
import { ExportExcelMenu } from '@/components/reports/export-excel-menu'
import { mockCsvDownload } from '@/components/reports/export-excel-menu'
import { ReportEmptyState } from '@/components/reports/report-empty-state'
import { ReportLoadingState } from '@/components/reports/report-loading-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CircleAlert } from 'lucide-react'
import { KpiMultiSelect } from './KpiReportFilterForm'
import { KpiResultsTable } from './KpiResultsTable'
import { BRANCHES } from '@/mock/seed/branches'
import {
  KPI_RECEPTIONIST_OPTIONS,
  KPI_NHOM_SAN_PHAM_OPTIONS,
  fetchKpiTiepNhanReport,
} from '@/mock/reports/kpi-mock'
import type {
  KpiFilterParams,
  KpiRow,
  PeriodMode,
  ReportResult,
} from '@/mock/reports/report-types'

// ── Flat Zod schema (mirrors KpiReportFilterForm's shape) ────────────────────

const filterSchema = z
  .object({
    mode: z.enum(['ngay', 'thang', 'nam']),
    chiNhanh: z.string().default('all'),
    personIds: z.array(z.string()).default([]),
    nhomSanPhamIds: z.array(z.string()).default([]),
    tuNgay: z.string().optional(),
    denNgay: z.string().optional(),
    nam: z.coerce.number().int().min(2000).max(2100).optional(),
    tuThang: z.coerce.number().int().min(1).max(12).optional(),
    denThang: z.coerce.number().int().min(1).max(12).optional(),
    tuNam: z.coerce.number().int().min(2000).max(2100).optional(),
    denNam: z.coerce.number().int().min(2000).max(2100).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.mode === 'ngay') {
      if (!d.tuNgay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng chọn ngày bắt đầu',
          path: ['tuNgay'],
        })
      }
      if (!d.denNgay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng chọn ngày kết thúc',
          path: ['denNgay'],
        })
      }
      if (d.tuNgay && d.denNgay && new Date(d.denNgay) < new Date(d.tuNgay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Đến ngày phải ≥ Từ ngày',
          path: ['denNgay'],
        })
      }
    }
  })

type FilterValues = z.infer<typeof filterSchema>

function getDefaultValues(): FilterValues {
  const today = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  const currentYear = today.getFullYear()
  return {
    mode: 'ngay',
    chiNhanh: 'all',
    personIds: [],
    nhomSanPhamIds: [],
    tuNgay: from.toISOString().slice(0, 10),
    denNgay: today.toISOString().slice(0, 10),
    nam: currentYear,
    tuThang: 1,
    denThang: 12,
    tuNam: currentYear - 1,
    denNam: currentYear,
  }
}

export default function KpiTiepNhanReportPage() {
  const [mode, setMode] = useState<PeriodMode>('ngay')
  const [hasRun, setHasRun] = useState(false)
  const [params, setParams] = useState<KpiFilterParams | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: getDefaultValues(),
    mode: 'onSubmit',
  })

  function handleModeChange(next: PeriodMode) {
    setMode(next)
    form.setValue('mode', next)
    form.clearErrors()
  }

  const { data, isFetching, isError, refetch } = useQuery<ReportResult<KpiRow>>(
    {
      queryKey: ['kpi-tiep-nhan-report', params],
      queryFn: () => fetchKpiTiepNhanReport(params!),
      enabled: hasRun && params !== null,
      retry: false,
      staleTime: 0,
    },
  )

  function handleSubmit(values: FilterValues) {
    const base: KpiFilterParams = {
      mode: values.mode,
      chiNhanh: values.chiNhanh,
      personIds: values.personIds,
      nhomSanPhamIds: values.nhomSanPhamIds,
    }
    if (values.mode === 'ngay') {
      base.tuNgay = values.tuNgay
      base.denNgay = values.denNgay
    } else if (values.mode === 'thang') {
      base.nam = values.nam
      base.tuThang = values.tuThang
      base.denThang = values.denThang
    } else {
      base.tuNam = values.tuNam
      base.denNam = values.denNam
    }
    queryClient.removeQueries({ queryKey: ['kpi-tiep-nhan-report'] })
    setParams(base)
    setHasRun(true)
  }

  const rows = data?.rows ?? []
  const resultMode = params?.mode ?? 'ngay'

  return (
    <div className="space-y-0">
      <PageHeader
        title="Báo Cáo KPI Tiếp Nhận"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Báo Cáo', href: ROUTES.reports },
          { label: 'KPI Tiếp nhận' },
        ]}
      />

      <div className="space-y-4 p-6">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void form.handleSubmit(handleSubmit)()
                }
              }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="chiNhanh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi nhánh</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tất cả chi nhánh" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                          {BRANCHES.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiếp tân</FormLabel>
                      <FormControl>
                        <KpiMultiSelect
                          ariaLabel="Tiếp tân"
                          options={KPI_RECEPTIONIST_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          selectAllLabel="Tất cả tiếp nhận"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nhomSanPhamIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhóm sản phẩm</FormLabel>
                      <FormControl>
                        <KpiMultiSelect
                          ariaLabel="Nhóm sản phẩm"
                          options={KPI_NHOM_SAN_PHAM_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          selectAllLabel="Tất cả nhóm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <PeriodModeFilter mode={mode} onModeChange={handleModeChange} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={isFetching} className="gap-1.5">
                  {isFetching ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Search className="size-4" aria-hidden="true" />
                  )}
                  {isFetching ? 'Đang tải…' : 'Tìm kiếm'}
                </Button>
                <ExportExcelMenu
                  groups={[
                    {
                      label: 'File báo cáo',
                      items: [
                        {
                          label: 'Xuất Excel File',
                          onExport: () =>
                            mockCsvDownload(
                              'kpi-tiep-nhan-bao-cao.csv',
                              'Báo Cáo KPI Tiếp Nhận',
                            ),
                        },
                      ],
                    },
                  ]}
                />
              </div>
            </form>
          </Form>
        </div>

        {!hasRun && <ReportEmptyState hasRun={false} />}

        {hasRun && isFetching && <ReportLoadingState rows={8} cols={8} />}

        {hasRun && !isFetching && isError && (
          <Alert
            variant="destructive"
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <AlertDescription>
                Không thể tải dữ liệu. Vui lòng thử lại.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0"
            >
              Thử lại
            </Button>
          </Alert>
        )}

        {hasRun && !isFetching && !isError && rows.length === 0 && (
          <ReportEmptyState hasRun={true} />
        )}

        {hasRun && !isFetching && !isError && rows.length > 0 && (
          <KpiResultsTable data={rows} mode={resultMode} />
        )}
      </div>
    </div>
  )
}

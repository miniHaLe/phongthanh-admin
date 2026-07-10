/**
 * KPI report page — standalone (Phase 7 — owned exclusively).
 * Orchestrates KpiReportFilterForm, KpiResultsTable, KpiCharts.
 * Does NOT reuse ReportPage (too bespoke) but shares ExportExcelMenu,
 * ReportEmptyState, and ReportLoadingState.
 */
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { ReportEmptyState } from '@/components/reports/report-empty-state'
import { ReportLoadingState } from '@/components/reports/report-loading-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CircleAlert } from 'lucide-react'
import { KpiReportFilterForm } from './KpiReportFilterForm'
import { KpiResultsTable } from './KpiResultsTable'
import { KpiCharts } from './KpiCharts'
import { fetchKpiReport } from '@/mock/reports/kpi-mock'
import type {
  KpiFilterParams,
  KpiRow,
  ReportResult,
} from '@/mock/reports/report-types'

export default function KpiReportPage() {
  const [hasRun, setHasRun] = useState(false)
  const [params, setParams] = useState<KpiFilterParams | null>(null)
  const queryClient = useQueryClient()

  const { data, isFetching, isError, refetch } = useQuery<ReportResult<KpiRow>>(
    {
      queryKey: ['kpi-report', params],
      queryFn: () => fetchKpiReport(params!),
      enabled: hasRun && params !== null,
      retry: false,
      staleTime: 0,
    },
  )

  function handleSubmit(filterParams: KpiFilterParams) {
    // Remove stale results when filter changes
    queryClient.removeQueries({ queryKey: ['kpi-report'] })
    setParams(filterParams)
    setHasRun(true)
  }

  const rows = data?.rows ?? []
  const mode = params?.mode ?? 'ngay'

  return (
    <div className="space-y-0">
      <PageHeader
        title="Báo Cáo KPI"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Báo Cáo', href: ROUTES.reports },
          { label: 'KPI' },
        ]}
      />

      <div className="space-y-4 p-6">
        {/* Filter form */}
        <KpiReportFilterForm onSubmit={handleSubmit} isLoading={isFetching} />

        {/* Results area */}
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
          <>
            {/* Charts above table */}
            <div className="rounded-lg border bg-card p-4">
              <KpiCharts data={rows} mode={mode} />
            </div>

            {/* Results table */}
            <KpiResultsTable data={rows} mode={mode} />
          </>
        )}
      </div>
    </div>
  )
}

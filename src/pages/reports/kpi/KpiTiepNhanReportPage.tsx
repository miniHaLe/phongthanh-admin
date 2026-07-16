import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import { PageHeader } from '@/components/shared'
import { ReportEmptyState } from '@/components/reports/report-empty-state'
import { ReportLoadingState } from '@/components/reports/report-loading-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import {
  computeKpiAging,
  resolveReportPeriodBounds,
} from '@/domains/reports/aging-buckets'
import {
  MOCK_TICKETS,
  REPAIR_MOCK_REFERENCE_EPOCH_MS,
} from '@/domains/repair/mock-data'
import type { KpiFilterParams } from '@/mock/reports/report-types'
import type { KpiPersonOption } from '@/mock/reports/kpi-mock'
import { KpiReportFilterForm } from './KpiReportFilterForm'
import { KpiResultsTable } from './KpiResultsTable'

const REPORT_REFERENCE_DATE = new Date(REPAIR_MOCK_REFERENCE_EPOCH_MS)
const RECEPTIONIST_OPTIONS: KpiPersonOption[] = [
  ...new Set(MOCK_TICKETS.map((ticket) => ticket.nguoiNhan)),
]
  .sort((left, right) => left.localeCompare(right, 'vi'))
  .map((name) => ({ id: name, label: name }))

function computeRows(params: KpiFilterParams) {
  const period = resolveReportPeriodBounds(params, REPORT_REFERENCE_DATE)
  return computeKpiAging(MOCK_TICKETS, {
    personKey: 'receiver',
    ...period,
    branchId: params.chiNhanh === 'all' ? undefined : params.chiNhanh,
    personIds: params.personIds,
    productGroupIds: params.nhomSanPhamIds,
  })
}

export default function KpiTiepNhanReportPage() {
  const [hasRun, setHasRun] = useState(false)
  const [params, setParams] = useState<KpiFilterParams | null>(null)
  const queryClient = useQueryClient()

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['kpi-tiep-nhan-report', params],
    queryFn: () => Promise.resolve(computeRows(params!)),
    enabled: hasRun && params !== null,
    retry: false,
    staleTime: 0,
  })

  function handleSubmit(filterParams: KpiFilterParams) {
    queryClient.removeQueries({ queryKey: ['kpi-tiep-nhan-report'] })
    setParams(filterParams)
    setHasRun(true)
  }

  const rows = data ?? []

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
        <KpiReportFilterForm
          onSubmit={handleSubmit}
          isLoading={isFetching}
          exportRows={rows}
          personLabel="Tiếp tân"
          personOptions={RECEPTIONIST_OPTIONS}
          selectAllLabel="Tất cả tiếp nhận"
          reportKind="receiver"
          referenceDate={REPORT_REFERENCE_DATE}
        />

        {!hasRun && <ReportEmptyState hasRun={false} />}
        {hasRun && isFetching && <ReportLoadingState rows={8} cols={11} />}

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
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </Alert>
        )}

        {hasRun && !isFetching && !isError && rows.length === 0 && (
          <ReportEmptyState hasRun={true} />
        )}

        {hasRun && !isFetching && !isError && rows.length > 0 && (
          <KpiResultsTable data={rows} personLabel="Tiếp tân" />
        )}
      </div>
    </div>
  )
}

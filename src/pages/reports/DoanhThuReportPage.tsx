/**
 * Báo Cáo Doanh Thu page (Phase 7 — owned exclusively).
 */
import { ReportPage } from '@/components/reports/report-page'
import { REPORT_CONFIGS } from '@/mock/reports/report-configs'

const config = REPORT_CONFIGS.find((c) => c.id === 'doanh-thu')!

export default function DoanhThuReportPage() {
  return (
    <ReportPage
      reportId={config.id}
      title={config.title}
      filterSchema={config.filterSchema}
      defaultValues={config.defaultValues}
      columns={config.columns}
      queryFn={config.queryFn}
      exportGroups={config.exportGroups}
    />
  )
}

/**
 * Báo cáo tình trạng chung (Phase 7 — owned exclusively).
 * Chart-first report: side-by-side column + pie chart of ticket counts across
 * all 15 legacy statuses, filtered by Nhà sản xuất + date range. Bespoke page
 * (chart-first shape diverges from the generic ReportPage shell).
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import {
  PageHeader,
  ServerAutocomplete,
  type AutocompleteOption,
} from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusColumnChart } from '@/components/reports/status-column-chart'
import { StatusPieChart } from '@/components/reports/status-pie-chart'
import { ReportDrilldown } from '@/components/reports/report-drilldown'
import { ReportLoadingState } from '@/components/reports/report-loading-state'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { MANUFACTURERS } from '@/domains/repair/reference-data'
import {
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_LABEL,
  STATUS_HEX,
} from '@/domains/repair/status'
import { mockDelay } from '@/lib/mock-delay'
import type { RepairTicket } from '@/domains/repair/types'
import type { RepairStatusId } from '@/domains/repair/status'
import type { StatusColumnDatum } from '@/components/reports/status-column-chart'

function defaultFromIso(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface TinhTrangChungParams {
  nhaSanXuatId?: string
  tuNgay: string
  denNgay: string
}

interface TinhTrangChungResult {
  chartData: StatusColumnDatum[]
  ticketsByStatus: Map<RepairStatusId, RepairTicket[]>
}

async function fetchTinhTrangChungReport(
  params: TinhTrangChungParams,
): Promise<TinhTrangChungResult> {
  await mockDelay(200, 150)

  const fromMs = new Date(params.tuNgay).getTime()
  const toMs = new Date(params.denNgay).getTime() + 86_400_000 - 1

  const matches = MOCK_TICKETS.filter((t) => {
    if (params.nhaSanXuatId && t.nhaSanXuatId !== params.nhaSanXuatId)
      return false
    const nhanMs = new Date(t.ngayNhan).getTime()
    return nhanMs >= fromMs && nhanMs <= toMs
  })

  const ticketsByStatus = new Map<RepairStatusId, RepairTicket[]>()
  for (const t of matches) {
    const list = ticketsByStatus.get(t.tinhTrang) ?? []
    list.push(t)
    ticketsByStatus.set(t.tinhTrang, list)
  }

  const chartData: StatusColumnDatum[] = REPAIR_STATUS_DISPLAY_ORDER.map(
    (id) => ({
      label: STATUS_LABEL[id],
      count: ticketsByStatus.get(id)?.length ?? 0,
      color: STATUS_HEX[id],
      key: id,
    }),
  ).filter((d) => d.count > 0)

  return { chartData, ticketsByStatus }
}

async function searchManufacturers(
  query: string,
): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase()
  return MANUFACTURERS.filter((m) => m.ten.toLowerCase().includes(q)).map(
    (m) => ({ id: m.id, label: m.ten }),
  )
}

export default function TinhTrangChungReportPage() {
  const [nsx, setNsx] = useState<AutocompleteOption | null>(null)
  const [tuNgay, setTuNgay] = useState(defaultFromIso())
  const [denNgay, setDenNgay] = useState(todayIso())
  const [barStatus, setBarStatus] = useState<RepairStatusId | null>(null)
  const [pieStatus, setPieStatus] = useState<RepairStatusId | null>(null)

  const [submittedParams, setSubmittedParams] = useState<TinhTrangChungParams>(
    { tuNgay: defaultFromIso(), denNgay: todayIso() },
  )
  const [hasRun, setHasRun] = useState(false)

  function handleSearch() {
    setBarStatus(null)
    setPieStatus(null)
    setSubmittedParams({ nhaSanXuatId: nsx?.id, tuNgay, denNgay })
    setHasRun(true)
  }

  const { data: queryData, isFetching: fetching } = useQuery({
    queryKey: ['tinh-trang-chung-report', submittedParams],
    queryFn: () => fetchTinhTrangChungReport(submittedParams),
    enabled: hasRun,
  })

  const list1 = barStatus
    ? (queryData?.ticketsByStatus.get(barStatus) ?? [])
    : []
  const list2 = pieStatus
    ? (queryData?.ticketsByStatus.get(pieStatus) ?? [])
    : []

  return (
    <div className="space-y-0">
      <PageHeader
        title="Báo cáo tình trạng chung"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Báo Cáo', href: ROUTES.reports },
          { label: 'Tình trạng chung' },
        ]}
      />

      <div className="space-y-4 p-6">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Nhà sản xuất</Label>
              <ServerAutocomplete
                value={nsx}
                onChange={setNsx}
                fetchOptions={searchManufacturers}
                placeholder="Chọn nhà sản xuất…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ttc-tu-ngay">Từ ngày</Label>
              <Input
                id="ttc-tu-ngay"
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ttc-den-ngay">Đến ngày</Label>
              <Input
                id="ttc-den-ngay"
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSearch} disabled={fetching} className="gap-1.5">
              {fetching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              {fetching ? 'Đang tải…' : 'Tìm kiếm'}
            </Button>
          </div>
        </div>

        {hasRun && fetching && !queryData && (
          <ReportLoadingState rows={6} cols={4} />
        )}

        {hasRun && (!fetching || queryData) && (
          <>
            <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 lg:grid-cols-2">
              <StatusColumnChart
                title="Báo cáo tình trạng chung"
                data={queryData?.chartData ?? []}
                onBarClick={(d) => setBarStatus(d.key as RepairStatusId)}
              />
              <StatusPieChart
                title="Báo cáo tình trạng chung"
                data={queryData?.chartData ?? []}
                onSliceClick={(d) => setPieStatus(d.key as RepairStatusId)}
              />
            </div>

            <h2 className="text-base font-semibold text-foreground">
              Danh sách chi tiết
            </h2>

            {barStatus && (
              <ReportDrilldown
                title={`Danh sách phiếu — ${STATUS_LABEL[barStatus]}`}
                tickets={list1}
              />
            )}
            {pieStatus && (
              <ReportDrilldown
                title={`Danh sách phiếu — ${STATUS_LABEL[pieStatus]}`}
                tickets={list2}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

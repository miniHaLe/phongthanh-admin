/**
 * Báo cáo tình trạng kỹ thuật (Phase 7 — owned exclusively).
 * Chart-first report: column chart of ticket counts per technician for a
 * single selected status. Bespoke page (not the generic ReportPage — the
 * filter shape + auto-run + drill-down here diverge too far from the
 * date-range/chi-nhánh shell the other reports share).
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  StatusColumnChart,
  type StatusColumnDatum,
} from '@/components/reports/status-column-chart'
import { ReportDrilldown } from '@/components/reports/report-drilldown'
import { ReportLoadingState } from '@/components/reports/report-loading-state'
import {
  MOCK_TICKETS,
  REPAIR_MOCK_REFERENCE_EPOCH_MS,
} from '@/domains/repair/mock-data'
import { TECHNICIANS } from '@/domains/repair/reference-data'
import {
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_LABEL,
  STATUS_HEX,
  type RepairStatusId,
} from '@/domains/repair/status'
import { mockDelay } from '@/lib/mock-delay'
import type { RepairTicket } from '@/domains/repair/types'

const DEFAULT_STATUS_ID: RepairStatusId = 9 // Sửa Xong

function defaultFromIso(): string {
  const date = new Date(REPAIR_MOCK_REFERENCE_EPOCH_MS)
  date.setDate(date.getDate() - 30)
  return date.toISOString().slice(0, 10)
}

function defaultToIso(): string {
  return new Date(REPAIR_MOCK_REFERENCE_EPOCH_MS).toISOString().slice(0, 10)
}

interface KyThuatReportParams {
  statusId: RepairStatusId
  kyThuatId?: string
  tuNgay: string
  denNgay: string
}

interface KyThuatReportResult {
  chartData: StatusColumnDatum[]
  ticketsByTech: Map<string, RepairTicket[]>
}

/** Aggregate MOCK_TICKETS into per-technician counts for one status + date range. */
async function fetchKyThuatStatusReport(
  params: KyThuatReportParams,
): Promise<KyThuatReportResult> {
  await mockDelay(200, 150)

  const fromMs = new Date(params.tuNgay).getTime()
  const toMs = new Date(params.denNgay).getTime() + 86_400_000 - 1

  const matches = MOCK_TICKETS.filter((t) => {
    if (t.tinhTrang !== params.statusId) return false
    if (params.kyThuatId && t.kyThuatId !== params.kyThuatId) return false
    const nhanMs = new Date(t.ngayNhan).getTime()
    return nhanMs >= fromMs && nhanMs <= toMs
  })

  const ticketsByTech = new Map<string, RepairTicket[]>()
  for (const t of matches) {
    const list = ticketsByTech.get(t.kyThuat) ?? []
    list.push(t)
    ticketsByTech.set(t.kyThuat, list)
  }

  const color = STATUS_HEX[params.statusId]
  const chartData: StatusColumnDatum[] = Array.from(ticketsByTech.entries())
    .map(([kyThuat, tickets]) => ({
      label: kyThuat,
      count: tickets.length,
      color,
      key: kyThuat,
    }))
    .sort((a, b) => b.count - a.count)

  return { chartData, ticketsByTech }
}

async function searchTechnicians(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase()
  return TECHNICIANS.filter((t) => t.ten.toLowerCase().includes(q)).map(
    (t) => ({ id: t.id, label: t.ten }),
  )
}

export default function KyThuatReportPage() {
  const [statusId, setStatusId] = useState<RepairStatusId>(DEFAULT_STATUS_ID)
  const [kyThuat, setKyThuat] = useState<AutocompleteOption | null>(null)
  const [tuNgay, setTuNgay] = useState(defaultFromIso())
  const [denNgay, setDenNgay] = useState(defaultToIso())
  const [selectedTech, setSelectedTech] = useState<string | null>(null)

  // Auto-runs on mount: initial submittedParams already reflects the default
  // filter values, so the first query fires without waiting for a click.
  const [submittedParams, setSubmittedParams] = useState<KyThuatReportParams>({
    statusId: DEFAULT_STATUS_ID,
    tuNgay: defaultFromIso(),
    denNgay: defaultToIso(),
  })

  const { data, isFetching } = useQuery({
    queryKey: ['ky-thuat-status-report', submittedParams],
    queryFn: () => fetchKyThuatStatusReport(submittedParams),
  })

  function handleSearch() {
    setSelectedTech(null)
    setSubmittedParams({ statusId, kyThuatId: kyThuat?.id, tuNgay, denNgay })
  }

  const statusLabel = STATUS_LABEL[submittedParams.statusId]
  const drilldownTickets = selectedTech
    ? (data?.ticketsByTech.get(selectedTech) ?? [])
    : []

  return (
    <div className="space-y-0">
      <PageHeader
        title="Báo cáo tình trạng kỹ thuật"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Báo Cáo', href: ROUTES.reports },
          { label: 'Tình trạng kỹ thuật' },
        ]}
      />

      <div className="space-y-4 p-6">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="ky-thuat-tinh-trang">Tình trạng</Label>
              <Select
                value={String(statusId)}
                onValueChange={(v) => setStatusId(Number(v) as RepairStatusId)}
              >
                <SelectTrigger id="ky-thuat-tinh-trang" aria-label="Tình trạng">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPAIR_STATUS_DISPLAY_ORDER.map((id) => (
                    <SelectItem key={id} value={String(id)}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: STATUS_HEX[id] }}
                        />
                        {STATUS_LABEL[id]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Kỹ thuật</Label>
              <ServerAutocomplete
                value={kyThuat}
                onChange={setKyThuat}
                fetchOptions={searchTechnicians}
                placeholder="Chọn kỹ thuật…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ky-thuat-tu-ngay">Từ ngày</Label>
              <Input
                id="ky-thuat-tu-ngay"
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ky-thuat-den-ngay">Đến ngày</Label>
              <Input
                id="ky-thuat-den-ngay"
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSearch} disabled={isFetching} className="gap-1.5">
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              {isFetching ? 'Đang tải…' : 'Xem'}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          {isFetching && !data ? (
            <ReportLoadingState rows={6} cols={4} />
          ) : (
            <StatusColumnChart
              title={`Báo cáo kỹ thuật tình trạng ${statusLabel}`}
              data={data?.chartData ?? []}
              onBarClick={(d) => setSelectedTech(String(d.key))}
            />
          )}
        </div>

        {selectedTech && (
          <ReportDrilldown
            title={`Danh sách phiếu — ${selectedTech}`}
            tickets={drilldownTickets}
          />
        )}
      </div>
    </div>
  )
}

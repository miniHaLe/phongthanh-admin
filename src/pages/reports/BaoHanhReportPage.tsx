/**
 * Báo cáo SCBH Kỹ thuật (Phase 7 — owned exclusively).
 * Per-technician warranty-repair cost report: filters by Kỹ thuật + date
 * range (Từ ngày defaults 1 month back, Đến ngày 1 month ahead of Từ ngày).
 * Bespoke page — the technician-cost-aggregate shape diverges from the
 * generic ReportPage date-range shell the other reports share.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search, FileSpreadsheet } from 'lucide-react'
import { PageHeader, ServerAutocomplete, type AutocompleteOption } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ReportResultsTable } from '@/components/reports/report-results-table'
import { ReportEmptyState } from '@/components/reports/report-empty-state'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { TECHNICIANS } from '@/domains/repair/reference-data'
import { formatVND } from '@/lib/format'
import { mockDelay } from '@/lib/mock-delay'
import { exportToXlsx } from '@/lib/export-xlsx'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReportRow } from '@/mock/reports/report-types'

function defaultFromIso(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

function defaultToIso(fromIso: string): string {
  const d = new Date(fromIso)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

interface BaoHanhParams {
  kyThuatId?: string
  tuNgay: string
  denNgay: string
}

type BaoHanhRow = ReportRow

async function fetchBaoHanhCostReport(
  params: BaoHanhParams,
): Promise<BaoHanhRow[]> {
  await mockDelay(200, 150)

  const fromMs = new Date(params.tuNgay).getTime()
  const toMs = new Date(params.denNgay).getTime() + 86_400_000 - 1

  const matches = MOCK_TICKETS.filter((t) => {
    if (t.hinhThuc !== 'bao_hanh') return false
    if (params.kyThuatId && t.kyThuatId !== params.kyThuatId) return false
    const nhanMs = new Date(t.ngayNhan).getTime()
    return nhanMs >= fromMs && nhanMs <= toMs
  })

  const byTech = new Map<
    string,
    { soLuongPhieu: number; chiPhiLinhKien: number; chiPhiNhanCong: number; tongChiPhi: number }
  >()

  for (const t of matches) {
    const acc = byTech.get(t.kyThuat) ?? {
      soLuongPhieu: 0,
      chiPhiLinhKien: 0,
      chiPhiNhanCong: 0,
      tongChiPhi: 0,
    }
    acc.soLuongPhieu += 1
    acc.chiPhiLinhKien += t.chiPhiLinhKien
    acc.chiPhiNhanCong += t.chiPhiNhanCong
    acc.tongChiPhi += t.chiPhiThucTe
    byTech.set(t.kyThuat, acc)
  }

  return Array.from(byTech.entries())
    .map(([kyThuat, acc]) => ({ kyThuat, ...acc }))
    .sort((a, b) => b.tongChiPhi - a.tongChiPhi)
}

async function searchTechnicians(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase()
  return TECHNICIANS.filter((t) => t.ten.toLowerCase().includes(q)).map(
    (t) => ({ id: t.id, label: t.ten }),
  )
}

const COLUMNS: ColumnDef<BaoHanhRow>[] = [
  { accessorKey: 'kyThuat', header: 'Kỹ thuật' },
  { accessorKey: 'soLuongPhieu', header: 'Số lượng phiếu' },
  {
    accessorKey: 'chiPhiLinhKien',
    header: 'Chi phí linh kiện',
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'chiPhiNhanCong',
    header: 'Chi phí nhân công',
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
  {
    accessorKey: 'tongChiPhi',
    header: 'Tổng chi phí',
    cell: ({ getValue }) => formatVND(getValue() as number),
  },
]

const EXPORT_COLUMNS = [
  { header: 'Kỹ thuật', accessor: (r: BaoHanhRow) => r.kyThuat },
  { header: 'Số lượng phiếu', accessor: (r: BaoHanhRow) => r.soLuongPhieu },
  { header: 'Chi phí linh kiện', accessor: (r: BaoHanhRow) => r.chiPhiLinhKien },
  { header: 'Chi phí nhân công', accessor: (r: BaoHanhRow) => r.chiPhiNhanCong },
  { header: 'Tổng chi phí', accessor: (r: BaoHanhRow) => r.tongChiPhi },
]

export default function BaoHanhReportPage() {
  const [kyThuat, setKyThuat] = useState<AutocompleteOption | null>(null)
  const [tuNgay, setTuNgay] = useState(defaultFromIso())
  const [denNgay, setDenNgay] = useState(defaultToIso(defaultFromIso()))
  const [hasRun, setHasRun] = useState(false)
  const [submitted, setSubmitted] = useState<BaoHanhParams | null>(null)

  const { data, isFetching } = useQuery({
    queryKey: ['bao-hanh-report', submitted],
    queryFn: () => fetchBaoHanhCostReport(submitted!),
    enabled: hasRun && submitted !== null,
  })

  function handleSearch() {
    setSubmitted({ kyThuatId: kyThuat?.id, tuNgay, denNgay })
    setHasRun(true)
  }

  const rows = useMemo(() => data ?? [], [data])

  async function handleExport() {
    await exportToXlsx({
      filename: 'bao-cao-scbh-ky-thuat.xlsx',
      sheetName: 'Báo cáo SCBH Kỹ thuật',
      columns: EXPORT_COLUMNS,
      rows,
    })
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="Báo cáo sửa chữa Kỹ thuật"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Danh sách phiếu sửa chữa' },
        ]}
      />

      <div className="space-y-4 p-6">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <Label htmlFor="bao-hanh-tu-ngay">Từ ngày</Label>
              <Input
                id="bao-hanh-tu-ngay"
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bao-hanh-den-ngay">Đến ngày</Label>
              <Input
                id="bao-hanh-den-ngay"
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={handleSearch} disabled={isFetching} className="gap-1.5">
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              {isFetching ? 'Đang tải…' : 'Xem Báo Cáo'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={handleExport}
            >
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {!hasRun && <ReportEmptyState hasRun={false} />}

        {hasRun && (
          <>
            <ReportResultsTable columns={COLUMNS} data={rows} isLoading={isFetching} />
            {!isFetching && rows.length === 0 && <ReportEmptyState hasRun={true} />}
          </>
        )}
      </div>
    </div>
  )
}

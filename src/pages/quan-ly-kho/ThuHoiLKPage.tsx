/**
 * ThuHoiLKPage — re-modeled as "Danh sách sử dụng linh kiện" (issued-part
 * usage list). File name + route path (`thu-hoi-lk`) kept stable to avoid nav
 * / deep-link churn; only the content, title, and breadcrumb changed.
 * List-only: no create/edit/delete. 21 verified columns, 11 filters, 3 KPI
 * boxes, state-dependent Tình trạng action cell (see issued-usage-*.tsx).
 */
import { useMemo, useState } from 'react'
import { Undo2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { isWithinInterval, parseISO } from 'date-fns'
import type { PaginationState } from '@tanstack/react-table'
import { DataTable, DataTablePagination, PageHeader, FilterPanel } from '@/components/shared'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { fetchIssuedUsageList } from '@/domains/warehouse/list-fetchers'
import { formatVND } from '@/lib/format'
import type { IssuedPartUsage } from '@/domains/warehouse/types'
import { KpiBox } from '@/features/warehouse/kpi-box'
import {
  ISSUED_USAGE_TABLE_ID,
  useIssuedUsageColumns,
} from '@/features/warehouse/issued-usage-table-columns'
import {
  IssuedUsageFilters,
  type IssuedUsageFilterValues,
} from '@/features/warehouse/issued-usage-filters'

const PAGE_SIZE_OPTIONS = [20, 50, 100]
const DEFAULT_PAGE_SIZE = 20

/** Apply the client-side-only filters (the fetcher supports branchId/tinhTrang/mucDich). */
function applyClientFilters(
  rows: IssuedPartUsage[],
  f: IssuedUsageFilterValues,
): IssuedPartUsage[] {
  let out = rows
  if (f.khoId) out = out.filter((r) => r.nhaKho === f.khoId)
  if (f.kyThuat) out = out.filter((r) => r.kyThuat === f.kyThuat)
  if (f.soPhieuCap) {
    const q = f.soPhieuCap.toLowerCase()
    out = out.filter((r) => r.soPhieuCap.toLowerCase().includes(q))
  }
  if (f.tinhTrangPhieu != null) out = out.filter((r) => r.ticketStatusId === f.tinhTrangPhieu)
  if (f.soPhieuSC) {
    const q = f.soPhieuSC.toLowerCase()
    out = out.filter((r) => r.soPhieuSC.toLowerCase().includes(q))
  }
  if (f.soPhieuHang) {
    const q = f.soPhieuHang.toLowerCase()
    out = out.filter((r) => r.soPhieuHang.toLowerCase().includes(q))
  }
  if (f.maSanPham) {
    const q = f.maSanPham.toLowerCase()
    out = out.filter(
      (r) => r.maHang.toLowerCase().includes(q) || r.tenHang.toLowerCase().includes(q),
    )
  }
  if (f.nsx) out = out.filter((r) => r.nsx === f.nsx)
  if (f.dateFrom || f.dateTo) {
    const field = f.dateType === 'giao' ? 'ngayGiao' : 'ngayCap'
    const from = f.dateFrom ? parseISO(f.dateFrom) : new Date(0)
    const to = f.dateTo ? parseISO(f.dateTo) : new Date(8640000000000000)
    out = out.filter((r) => {
      const v = r[field]
      if (!v) return false
      try {
        return isWithinInterval(parseISO(v), { start: from, end: to })
      } catch {
        return false
      }
    })
  }
  return out
}

export default function ThuHoiLKPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<IssuedUsageFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const commands = useMemo(
    () => [
      {
        id: 'nav-thu-hoi-lk',
        label: 'Mở Danh sách sử dụng linh kiện',
        group: 'Tài chính & Kho',
        icon: Undo2,
        keywords: ['danh sach su dung linh kien', 'ds cap lk', 'thu hoi'],
        run: () => navigate(ROUTES.inventoryPartsRecovery),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-thu-hoi-lk', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'issued-usage-list',
      { branchId: filters.branchId, tinhTrang: filters.tinhTrang, mucDich: filters.mucDich },
    ],
    queryFn: () =>
      fetchIssuedUsageList({
        branchId: filters.branchId,
        tinhTrang: filters.tinhTrang,
        mucDich: filters.mucDich,
        pageSize: 300,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useIssuedUsageColumns()

  const filteredRows = useMemo(
    () => applyClientFilters(data?.data ?? [], filters),
    [data?.data, filters],
  )
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }

  const kpi = useMemo(() => {
    let tongCap = 0
    let chuaGiao = 0
    let daGiao = 0
    for (const r of filteredRows) {
      tongCap += r.soLuongCap
      const amount = r.soLuongCap * 100_000
      if (r.ngayGiao) daGiao += amount
      else chuaGiao += amount
    }
    return { tongCap, chuaGiao, daGiao }
  }, [filteredRows])

  function handleFilterChange(next: Partial<IssuedUsageFilterValues>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter((v) => v != null && v !== '').length

  return (
    <div className="space-y-0">
      <PageHeader
        title="Danh sách sử dụng linh kiện"
        breadcrumbs={[
          { label: 'Quản Lý Kho', href: ROUTES.inventory },
          { label: 'Danh sách sử dụng linh kiện' },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          defaultExpanded
        >
          <IssuedUsageFilters filters={filters} onChange={handleFilterChange} />
        </FilterPanel>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiBox label="Tổng cấp" value={String(kpi.tongCap)} tone="yellow" />
          <KpiBox label="Tổng tiền LK chưa giao" value={formatVND(kpi.chuaGiao)} tone="blue" />
          <KpiBox label="Tổng tiền LK đã giao" value={formatVND(kpi.daGiao)} tone="green" />
        </div>

        <div className="min-w-[1500px] overflow-x-auto">
          <DataTable
            tableId={ISSUED_USAGE_TABLE_ID}
            columns={columns}
            data={pageRows}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyMessage="Không có dữ liệu sử dụng linh kiện"
            manualPagination
            pagination={pagination}
            pageCount={totalPages}
            getRowId={(r) => r.id}
          />
        </div>

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
    </div>
  )
}

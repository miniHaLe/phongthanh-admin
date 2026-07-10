/**
 * CapLinhKienPage — Cấp Linh Kiện list. Verified 7-column reference set (no
 * checkbox, no per-row edit), Tổng tiền info-box (yellow), Chi tiết + print
 * per row, Thêm phiếu cấp → full-page create editor.
 */
import { useMemo, useState } from 'react'
import { Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { isWithinInterval, parseISO } from 'date-fns'
import type { PaginationState } from '@tanstack/react-table'
import { DataTable, DataTablePagination, PageHeader, FilterPanel } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { fetchCheckoutList } from '@/domains/warehouse/list-fetchers'
import { formatVND } from '@/lib/format'
import { exportToXlsx } from '@/lib/export-xlsx'
import type { CheckOutSlip } from '@/domains/warehouse/types'
import {
  CAP_LINH_KIEN_TABLE_ID,
  useCapLinhKienColumns,
} from '@/features/stockout/cap-linh-kien-table-columns'
import {
  CapLinhKienFilters,
  type CapLinhKienFilterValues,
} from '@/features/stockout/cap-linh-kien-filters'

const PAGE_SIZE_OPTIONS = [20, 50, 100]
const DEFAULT_PAGE_SIZE = 20

const EXPORT_COLUMNS = [
  { header: 'Số phiếu cấp', accessor: (r: CheckOutSlip) => r.soPhieuCap },
  { header: 'Ngày lập', accessor: (r: CheckOutSlip) => r.ngayLap },
  { header: 'Kỹ thuật', accessor: (r: CheckOutSlip) => r.kyThuat },
  { header: 'Số tiền', accessor: (r: CheckOutSlip) => r.soTien },
  { header: 'Người lập', accessor: (r: CheckOutSlip) => r.nguoiLap },
  { header: 'Ghi chú', accessor: (r: CheckOutSlip) => r.ghiChu },
]

function applyClientFilters(rows: CheckOutSlip[], f: CapLinhKienFilterValues): CheckOutSlip[] {
  let out = rows
  if (f.kyThuat) out = out.filter((r) => r.kyThuat === f.kyThuat)
  if (f.dateFrom || f.dateTo) {
    const from = f.dateFrom ? parseISO(f.dateFrom) : new Date(0)
    const to = f.dateTo ? parseISO(f.dateTo) : new Date(8640000000000000)
    out = out.filter((r) => {
      try {
        return isWithinInterval(parseISO(r.ngayLap), { start: from, end: to })
      } catch {
        return false
      }
    })
  }
  return out
}

export default function CapLinhKienPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<CapLinhKienFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const commands = useMemo(
    () => [
      {
        id: 'nav-cap-linh-kien',
        label: 'Mở Cấp Linh Kiện',
        group: 'Tài chính & Kho',
        icon: Wrench,
        keywords: ['cap linh kien', 'xuat kho', 'linh kien'],
        run: () => navigate(ROUTES.stockOutPartsDispatch),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-cap-linh-kien', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'cap-linh-kien-list',
      { branchId: filters.branchId, soPhieu: filters.soPhieuCap },
    ],
    queryFn: () =>
      fetchCheckoutList({
        branchId: filters.branchId,
        soPhieu: filters.soPhieuCap,
        pageSize: 300,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useCapLinhKienColumns()

  const filteredRows = useMemo(
    () => applyClientFilters(data?.data ?? [], filters),
    [data?.data, filters],
  )
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }
  const tongTien = filteredRows.reduce((s, r) => s + r.soTien, 0)

  function handleFilterChange(next: Partial<CapLinhKienFilterValues>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter((v) => v != null && v !== '').length

  async function handleExport() {
    await exportToXlsx({
      filename: 'cap-linh-kien',
      sheetName: 'Cấp Linh Kiện',
      columns: EXPORT_COLUMNS,
      rows: filteredRows,
    })
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="Cấp Linh Kiện"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Cấp Linh Kiện' },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          defaultExpanded
        >
          <CapLinhKienFilters filters={filters} onChange={handleFilterChange} />
        </FilterPanel>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => navigate(ROUTES.stockOutPartsDispatchCreate)}
          >
            Thêm phiếu cấp
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => refetch()}>
            Tìm kiếm
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => refetch()}>
            Tìm chi tiết
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => void handleExport()}>
            Xuất ra Excel
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => void handleExport()}>
            Báo cáo lợi nhuận
          </Button>

          <div className="flex-1" />

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            Tổng tiền: {formatVND(tongTien)}
          </div>
        </div>

        <div className="min-w-[1100px] overflow-x-auto">
          <DataTable
            tableId={CAP_LINH_KIEN_TABLE_ID}
            columns={columns}
            data={pageRows}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyMessage="Không có phiếu cấp linh kiện nào"
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

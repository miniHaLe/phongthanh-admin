/**
 * TraHangPage — Trả Hàng list. Verified 5-column reference set (checkbox + 4
 * data columns + Chọn). Per-row Chỉnh sửa/print/Chi tiết, bulk toolbar,
 * Hình thức trả filter, Tìm kiếm/Xuất Excel/Xuất Excel Chi Tiết.
 */
import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { isWithinInterval, parseISO } from 'date-fns'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import {
  DataTable,
  DataTablePagination,
  PageHeader,
  BulkActionsBar,
  FilterPanel,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { fetchReturnList } from '@/domains/warehouse/list-fetchers'
import type { ReturnSlip } from '@/domains/warehouse/types'
import {
  TRA_HANG_TABLE_ID,
  useTraHangColumns,
} from '@/features/stockout/tra-hang-table-columns'
import { TraHangFilters, type TraHangFilterValues } from '@/features/stockout/tra-hang-filters'
import { TraHangBatchToolbar } from '@/features/stockout/tra-hang-batch-toolbar'

import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const DEFAULT_PAGE_SIZE = 20

function applyClientFilters(rows: ReturnSlip[], f: TraHangFilterValues): ReturnSlip[] {
  let out = rows
  if (f.dateFrom || f.dateTo) {
    const from = f.dateFrom ? parseISO(f.dateFrom) : new Date(0)
    const to = f.dateTo ? parseISO(f.dateTo) : new Date(8640000000000000)
    out = out.filter((r) => {
      try {
        return isWithinInterval(parseISO(r.ngayTra), { start: from, end: to })
      } catch {
        return false
      }
    })
  }
  return out
}

export default function TraHangPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TraHangFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const commands = useMemo(
    () => [
      {
        id: 'nav-tra-hang',
        label: 'Mở Trả Hàng',
        group: 'Tài chính & Kho',
        icon: RotateCcw,
        keywords: ['tra hang', 'hoan hang', 'returns'],
        run: () => navigate(ROUTES.stockOutReturns),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-tra-hang', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'tra-hang-list',
      { branchId: filters.branchId, hinhThucTra: filters.hinhThucTra, soPhieu: filters.soPhieu },
    ],
    queryFn: () =>
      fetchReturnList({
        branchId: filters.branchId,
        hinhThucTra: filters.hinhThucTra,
        soPhieu: filters.soPhieu,
        pageSize: 300,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useTraHangColumns()

  const filteredRows = useMemo(
    () => applyClientFilters(data?.data ?? [], filters),
    [data?.data, filters],
  )
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }
  const selectedRows = filteredRows.filter((r) => rowSelection[r.id])

  function handleFilterChange(next: Partial<TraHangFilterValues>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter((v) => v != null && v !== '').length

  return (
    <div className="space-y-0">
      <PageHeader
        title="Trả Hàng"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Trả Hàng' },
        ]}
      >
        <Button size="sm" className="h-8" onClick={() => navigate(ROUTES.stockOutReturnsCreate)}>
          Thêm phiếu trả hàng
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          defaultExpanded
        >
          <TraHangFilters filters={filters} onChange={handleFilterChange} />
        </FilterPanel>

        <TraHangBatchToolbar allRows={filteredRows} onSearch={() => refetch()} />

        <BulkActionsBar count={selectedRows.length} />

        <DataTable
          tableId={TRA_HANG_TABLE_ID}
          columns={columns}
          data={pageRows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có phiếu trả hàng nào"
          manualPagination
          pagination={pagination}
          pageCount={totalPages}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(r) => r.id}
          scrollLabel="Bảng trả hàng"
          tableClassName="min-w-[900px]"
        />

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

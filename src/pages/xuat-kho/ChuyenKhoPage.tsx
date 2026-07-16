/**
 * ChuyenKhoPage — Chuyển Kho list. Verified 10-column reference set (checkbox
 * + Trạng thái lead + 8 data columns + Chọn). TWO create buttons (same-branch
 * / cross-branch), bulk toolbar, Trạng thái filter, Tìm kiếm/Xuất Excel/Xuất
 * Excel Chi Tiết.
 */
import { useMemo, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
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
import { fetchMovingList } from '@/domains/warehouse/list-fetchers'
import { BRANCH_NAME } from '@/mock/seed/branches'
import type { MovingSlip } from '@/domains/warehouse/types'
import {
  CHUYEN_KHO_TABLE_ID,
  useChuyenKhoColumns,
} from '@/features/stockout/chuyen-kho-table-columns'
import {
  ChuyenKhoFilters,
  type ChuyenKhoFilterValues,
} from '@/features/stockout/chuyen-kho-filters'
import { ChuyenKhoBatchToolbar } from '@/features/stockout/chuyen-kho-batch-toolbar'

import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const DEFAULT_PAGE_SIZE = 20

function applyClientFilters(rows: MovingSlip[], f: ChuyenKhoFilterValues): MovingSlip[] {
  let out = rows
  if (f.tuChiNhanh) {
    const name = BRANCH_NAME[f.tuChiNhanh as keyof typeof BRANCH_NAME]
    out = out.filter((r) => r.tuChiNhanh === name)
  }
  if (f.denChiNhanh) {
    const name = BRANCH_NAME[f.denChiNhanh as keyof typeof BRANCH_NAME]
    out = out.filter((r) => r.denChiNhanh === name)
  }
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

export default function ChuyenKhoPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ChuyenKhoFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const commands = useMemo(
    () => [
      {
        id: 'nav-chuyen-kho',
        label: 'Mở Chuyển Kho',
        group: 'Tài chính & Kho',
        icon: ArrowRightLeft,
        keywords: ['chuyen kho', 'transfer', 'dieu chuyen'],
        run: () => navigate(ROUTES.stockOutTransfer),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-chuyen-kho', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'chuyen-kho-list',
      { trangThai: filters.trangThai, soPhieu: filters.soPhieu },
    ],
    queryFn: () =>
      fetchMovingList({
        trangThai: filters.trangThai,
        soPhieu: filters.soPhieu,
        pageSize: 300,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useChuyenKhoColumns()

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

  function handleFilterChange(next: Partial<ChuyenKhoFilterValues>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter((v) => v != null && v !== '').length

  return (
    <div className="space-y-0">
      <PageHeader
        title="Chuyển Kho"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Chuyển Kho' },
        ]}
      >
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => navigate(ROUTES.stockOutTransferSameBranch)}
        >
          Chuyển cùng chi nhánh
        </Button>
        <Button
          size="sm"
          className="h-8"
          onClick={() => navigate(ROUTES.stockOutTransferCrossBranch)}
        >
          Chuyển khác chi nhánh
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          defaultExpanded
        >
          <ChuyenKhoFilters filters={filters} onChange={handleFilterChange} />
        </FilterPanel>

        <ChuyenKhoBatchToolbar allRows={filteredRows} onSearch={() => refetch()} />

        <BulkActionsBar count={selectedRows.length} />

        <DataTable
          tableId={CHUYEN_KHO_TABLE_ID}
          columns={columns}
          data={pageRows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có phiếu chuyển kho nào"
          manualPagination
          pagination={pagination}
          pageCount={totalPages}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(r) => r.id}
          scrollLabel="Bảng chuyển kho"
          tableClassName="min-w-[1400px]"
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

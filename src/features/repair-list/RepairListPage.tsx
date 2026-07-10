/**
 * Repair list page — the Index_8 operations console. Legend with live counts,
 * 14-column table with rich cells + row actions, checkbox multi-select driving
 * the batch toolbar, reference filter set, Xuất Excel. Route: /sua-chua-bao-hanh
 */
import { useCallback, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type {
  SortingState,
  PaginationState,
  RowSelectionState,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTablePagination,
  DataTableColumnConfig,
  StatusLegend,
  PageHeader,
  BulkActionsBar,
} from '@/components/shared'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { fetchRepairList } from '@/domains/repair/mock-data'
import type { RepairTicket } from '@/domains/repair/types'
import { useRepairFilters } from './hooks/use-repair-filters'
import {
  useRepairTableColumns,
  TABLE_ID,
  REPAIR_COLUMN_LABELS,
} from './hooks/use-repair-table-columns'
import { RepairFilters } from './RepairFilters'
import { RepairBatchToolbar } from './components/repair-batch-toolbar'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [20, 50, 100]
const DEFAULT_PAGE_SIZE = 20

export default function RepairListPage() {
  const navigate = useNavigate()
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useRepairFilters()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const handleFilterChange = useCallback(
    (next: Partial<typeof filters>) => {
      setFilters(next)
      setPage(1)
    },
    [setFilters],
  )

  const handleClear = useCallback(() => {
    clearFilters()
    setPage(1)
  }, [clearFilters])

  const { columns } = useRepairTableColumns()

  const queryParams = useMemo(() => {
    const sortField = sorting[0]?.id as keyof RepairTicket | undefined
    const sortDir: 'asc' | 'desc' | undefined = sorting[0]
      ? sorting[0].desc
        ? 'desc'
        : 'asc'
      : undefined
    return { ...filters, page, pageSize, sortField, sortDir }
  }, [filters, page, pageSize, sorting])

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['repair-list', queryParams],
    queryFn: () => fetchRepairList(queryParams),
    placeholderData: keepPreviousData,
  })

  const pagination: PaginationState = { pageIndex: page - 1, pageSize }

  const commands = useMemo(
    () => [
      {
        id: 'repair-create',
        label: 'Tạo phiếu mới',
        group: 'Sửa chữa',
        keywords: ['lap phieu', 'tao phieu', 'sua chua'],
        run: () => navigate(ROUTES.repairCreate),
      },
    ],
    [navigate],
  )
  useRegisterCommands('repair', commands)

  const tickets = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const statusCounts = data?.statusCounts ?? {}

  const selectedTickets = tickets.filter((t) => rowSelection[t.id])

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Sửa Chữa - Bảo Hành"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Sửa Chữa - Bảo Hành' },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <RepairFilters
          filters={filters}
          activeFilterCount={activeFilterCount}
          onChange={handleFilterChange}
          onClear={handleClear}
        />

        {/* Status legend with live counts */}
        <StatusLegend
          counts={statusCounts}
          onSelect={(id) => handleFilterChange({ tinhTrang: id })}
        />

        {/* Batch toolbar */}
        <RepairBatchToolbar
          selected={selectedTickets}
          filters={filters}
          total={total}
          onReload={() => {
            handleClear()
            refetch()
          }}
        />

        {/* Selection bar + count + column config */}
        <div className="flex flex-wrap items-center gap-2">
          <BulkActionsBar count={selectedTickets.length} />
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Tổng: <strong>{total}</strong> dòng, Trang {page} / {totalPages}
          </span>
          <DataTableColumnConfig
            tableId={TABLE_ID}
            columns={REPAIR_COLUMN_LABELS}
          />
        </div>

        <div
          className={cn(
            'transition-opacity duration-200',
            isFetching && !isLoading && 'opacity-60',
          )}
        >
          <div className="min-w-[1700px]">
            <DataTable
              tableId={TABLE_ID}
              columns={columns}
              data={tickets}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              emptyMessage="Không tìm thấy phiếu sửa chữa nào"
              sorting={sorting}
              onSortingChange={setSorting}
              manualPagination
              pagination={pagination}
              pageCount={totalPages}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={(t) => t.id}
            />
          </div>
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

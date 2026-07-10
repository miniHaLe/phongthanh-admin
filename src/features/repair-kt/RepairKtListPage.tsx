/**
 * Sửa Chữa-Bảo Hành KT — the technician-scoped repair board (RepairingM/Index
 * counterpart). KT-scoped list (10-status workshop subset only, filtered by
 * fetchRepairKtList), 14-column table, dual pagination, collapsible search.
 */
import { useCallback, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, DataTablePagination, PageHeader } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { fetchRepairKtList } from '@/domains/repair/mock-data'
import type { RepairListFilters, RepairListParams } from '@/domains/repair/types'
import { cn } from '@/lib/utils'
import { RepairKtFilters } from './RepairKtFilters'
import { useRepairKtColumns, TABLE_ID } from './hooks/use-repair-kt-columns'

const PAGE_SIZE_OPTIONS = [20, 50, 100]
const DEFAULT_PAGE_SIZE = 20

const EMPTY_FILTERS: RepairListFilters = {}

export default function RepairKtListPage() {
  const [filters, setFilters] = useState<RepairListFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] =
    useState<RepairListFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [panelOpen, setPanelOpen] = useState(true)

  const { columns } = useRepairKtColumns()

  const handleFilterChange = useCallback((next: Partial<RepairListFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }))
  }, [])

  const handleSearch = useCallback(() => {
    setAppliedFilters(filters)
    setPage(1)
  }, [filters])

  const handleReset = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setPage(1)
  }, [])

  const queryParams: RepairListParams = useMemo(
    () => ({ ...appliedFilters, page, pageSize }),
    [appliedFilters, page, pageSize],
  )

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['repair-kt', queryParams],
    queryFn: () => fetchRepairKtList(queryParams),
    placeholderData: keepPreviousData,
  })

  const tickets = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const paginationLabel = (
    <span className="text-sm text-muted-foreground" aria-live="polite">
      Tổng: <strong>{total}</strong> dòng, Trang {page} / {totalPages}
    </span>
  )

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Danh sách Phiếu sửa chữa"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Danh sách phiếu sửa chữa' },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold">Thông tin tìm kiếm</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setPanelOpen((p) => !p)}
              aria-expanded={panelOpen}
            >
              Nhấn để search
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  panelOpen && 'rotate-180',
                )}
              />
            </Button>
          </div>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-in-out',
              panelOpen ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0',
            )}
            aria-hidden={!panelOpen}
          >
            <div className="border-t border-border px-4 pb-4 pt-3">
              <RepairKtFilters filters={filters} onChange={handleFilterChange} />
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleReset}
                >
                  Tải lại trang
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dual pagination — above the table */}
        <div className="flex items-center justify-end">{paginationLabel}</div>

        <div
          className={cn(
            'transition-opacity duration-200',
            isFetching && !isLoading && 'opacity-60',
          )}
        >
          <div className="min-w-[1250px]">
            <DataTable
              tableId={TABLE_ID}
              columns={columns}
              data={tickets}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              emptyMessage="Không tìm thấy phiếu sửa chữa nào"
            />
          </div>
        </div>

        {!isError && (
          <>
            {/* Dual pagination — below the table */}
            <div className="flex items-center justify-end">{paginationLabel}</div>
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
          </>
        )}
      </div>
    </div>
  )
}

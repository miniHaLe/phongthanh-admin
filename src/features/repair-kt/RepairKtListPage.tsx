/**
 * Sửa Chữa-Bảo Hành KT — the technician-scoped repair board (RepairingM/Index
 * counterpart). KT-scoped list (10-status workshop subset only, filtered by
 * fetchRepairKtList), grouped table, dual pagination, collapsible search.
 */
import { useCallback, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DataTable,
  DataTablePagination,
  FilterPanel,
  PageHeader,
} from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { fetchRepairKtList } from '@/domains/repair/mock-data'
import type {
  RepairListFilters,
  RepairListParams,
  RepairTicket,
} from '@/domains/repair/types'
import { resolveTechnicianForUser } from '@/features/repair-shared/resolve-technician-for-user'
import { cn } from '@/lib/utils'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { RepairKtFilters } from './RepairKtFilters'
import { useRepairKtColumns, TABLE_ID } from './hooks/use-repair-kt-columns'
import { REPAIR_KT_BREADCRUMB_LABEL } from './repair-kt-constants'

import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const DEFAULT_PAGE_SIZE = 20

const EMPTY_FILTERS: RepairListFilters = {}

const REPAIR_KT_SORT_FIELD_MAP: Record<string, keyof RepairTicket> = {
  tinhTrang: 'tinhTrang',
  soPhieu: 'soPhieu',
  sanPham: 'tenSanPham',
  kyThuat: 'kyThuat',
  loaiSc: 'hinhThuc',
  chiPhi: 'chiPhiDuKien',
  ngayNhan: 'ngayNhan',
  ngayGiao: 'ngayGiao',
  chiTietSc: 'noiDungSuaChua',
  ghiChu: 'ghiChu',
  nguoiNhan: 'nguoiNhan',
  khuVuc: 'khuVuc',
}

interface RepairKtListPageProps {
  currentUserName?: string
}

export default function RepairKtListPage({
  currentUserName = CURRENT_USER.hoVaTen,
}: RepairKtListPageProps) {
  const [filters, setFilters] = useState<RepairListFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] =
    useState<RepairListFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([])
  const currentTechnician = useMemo(
    () => resolveTechnicianForUser(currentUserName),
    [currentUserName],
  )

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

  const handleMyTickets = useCallback(() => {
    if (!currentTechnician) return
    const nextFilters = {
      ...filters,
      kyThuatId: currentTechnician.id,
    }
    setFilters(nextFilters)
    setAppliedFilters(nextFilters)
    setPage(1)
  }, [currentTechnician, filters])

  const queryParams: RepairListParams = useMemo(
    () => ({
      ...appliedFilters,
      page,
      pageSize,
      sortField: sorting[0]
        ? REPAIR_KT_SORT_FIELD_MAP[sorting[0].id]
        : undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
    }),
    [appliedFilters, page, pageSize, sorting],
  )

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['repair-kt', queryParams],
    queryFn: () => fetchRepairKtList(queryParams),
    placeholderData: keepPreviousData,
  })

  const tickets = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const activeFilterCount = useMemo(
    () =>
      Object.values(filters).filter((value) =>
        Array.isArray(value)
          ? value.length > 0
          : value !== undefined && value !== null && value !== '',
      ).length,
    [filters],
  )

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
          { label: REPAIR_KT_BREADCRUMB_LABEL },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          triggerLabel="Thông tin tìm kiếm"
          filterCount={activeFilterCount}
          onClear={handleReset}
          defaultExpanded
          contentClassName="block space-y-3"
        >
          <RepairKtFilters filters={filters} onChange={handleFilterChange} />
          <div className="flex flex-wrap gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex"
                    tabIndex={currentTechnician ? undefined : 0}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-11 rounded-full md:h-8"
                      disabled={!currentTechnician}
                      aria-pressed={
                        !!currentTechnician &&
                        filters.kyThuatId === currentTechnician.id
                      }
                      onClick={handleMyTickets}
                    >
                      Phiếu của tôi
                    </Button>
                  </span>
                </TooltipTrigger>
                {!currentTechnician && (
                  <TooltipContent>
                    Tài khoản chưa gắn kỹ thuật viên
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Button size="sm" className="h-11 md:h-8" onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 md:h-8"
              onClick={handleReset}
            >
              Tải lại trang
            </Button>
          </div>
        </FilterPanel>

        <div
          className={cn(
            'transition-opacity duration-200',
            isFetching && !isLoading && 'opacity-60',
          )}
        >
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
            scrollLabel="Bảng sửa chữa bảo hành kỹ thuật"
            tableLayout="content-safe"
            tableMinWidth={1560}
          />
        </div>

        {!isError && (
          <>
            <div className="flex items-center justify-end">
              {paginationLabel}
            </div>
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

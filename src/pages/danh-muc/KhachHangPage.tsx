/**
 * Khách Hàng (CU1) — bespoke list (not the generic CrudTablePage) because the
 * reference has two distinct header create-flows (Thêm Khách Hàng / Thêm Đại
 * Lý) and an edit-only row action (no per-row delete — bulk-delete only).
 * Reuses the shared CRUD primitives directly (useCrud, DataTable, FilterPanel,
 * bulk-delete, selection column) while retaining both customer create flows.
 */
import { useMemo, useState, type ReactElement } from 'react'
import {
  UserPlus,
  Building2,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react'
import type { RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  DataTableColumnConfig,
  BulkActionsBar,
  FilterPanel,
  API_PAGE_SIZE_OPTIONS,
} from '@/components/shared'
import { CrudFilterFields } from '@/components/crud/crud-filter-fields'
import { countActiveFilterValues } from '@/components/crud/crud-filter-values'
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog'
import {
  failedBulkDeleteSelection,
  notifyBulkDeleteResult,
  selectedRowIds,
  useCrud,
} from '@/hooks/use-crud'
import { khachHangConfig } from '@/config/crud-configs/khach-hang.config'
import type { KhachHang } from '@/types/masterdata-types'
import { ThemKhachHangModal } from '@/features/customer/them-khach-hang-modal'
import { ThemDaiLyModal } from '@/features/customer/them-dai-ly-modal'
import { CustomerEditorDialog } from '@/features/customer/customer-editor-dialog'
import { useGeographyLookup } from '@/features/customer/use-geography-lookup'
import {
  buildCrudColumnDescriptors,
  buildCrudColumns,
} from '@/components/crud/build-crud-columns'
import { exportCurrentCrudPage } from '@/components/crud/export-crud-rows'
import { CustomerMobileCards } from '@/features/customer/customer-mobile-cards'
import {
  activeBranchApiId,
  useAppStore,
  type ActiveBranch,
} from '@/store/app-store'
import { branchLabel } from '@/mock/seed/branches'
import { cn } from '@/lib/utils'

export default function KhachHangPage(): ReactElement {
  const activeBranch = useAppStore((state) => state.activeBranch)

  return (
    <BranchScopedCustomerPage key={activeBranch} activeBranch={activeBranch} />
  )
}

function BranchScopedCustomerPage({
  activeBranch,
}: {
  activeBranch: ActiveBranch
}): ReactElement {
  const config = khachHangConfig
  const geography = useGeographyLookup()
  const crud = useCrud(
    config,
    true,
    { branchId: activeBranchApiId(activeBranch) },
    { refetchOnMount: 'always' },
  )
  const {
    params,
    setSearch,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    listQuery,
    bulkDelete,
    isBulkDeleting,
  } = crud

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [editRow, setEditRow] = useState<KhachHang | undefined>()
  const [themKhachHangOpen, setThemKhachHangOpen] = useState(false)
  const [themDaiLyOpen, setThemDaiLyOpen] = useState(false)

  const result = listQuery.data
  const selectedIds = selectedRowIds(rowSelection)

  const columns = useMemo(
    () =>
      buildCrudColumns(
        config,
        params,
        { onEdit: setEditRow },
        geography.lookups,
      ),
    [config, geography.lookups, params],
  )

  const filters = useMemo(
    () =>
      (config.filters ?? []).map((filter) =>
        filter.key === 'tinhThanhCode'
          ? { ...filter, options: geography.provinceOptions }
          : filter,
      ),
    [config, geography.provinceOptions],
  )

  const columnDescriptors = useMemo(
    () => buildCrudColumnDescriptors(config),
    [config],
  )

  async function handleBulkDeleteConfirm() {
    const result = await bulkDelete(selectedIds)
    setBulkDeleteOpen(false)
    setRowSelection(failedBulkDeleteSelection(result))
    notifyBulkDeleteResult(result)
  }

  function handleExport() {
    void exportCurrentCrudPage(config, result?.data ?? [], geography.lookups)
  }

  const toolbar = (
    <DataTableToolbar
      searchValue={params.search}
      onSearchChange={setSearch}
      searchPlaceholder="Tìm trong Khách Hàng…"
      right={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DataTableColumnConfig
            tableId={config.resourceKey}
            columns={columnDescriptors}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={handleExport}
            disabled={!geography.isReady}
            title={
              geography.isReady
                ? 'Xuất Excel (trang hiện tại)'
                : 'Đang tải danh mục địa chỉ'
            }
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>
        </div>
      }
    />
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">
            Phạm vi: {branchLabel(activeBranch)}
          </p>
          <span className="sr-only" aria-live="polite">
            {listQuery.isFetching
              ? listQuery.isLoading
                ? 'Đang tải danh sách khách hàng'
                : 'Đang cập nhật danh sách khách hàng'
              : 'Danh sách khách hàng đã cập nhật'}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {listQuery.isFetching && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="size-3.5 animate-spin" />
              {listQuery.isLoading ? 'Đang tải…' : 'Đang cập nhật…'}
            </span>
          )}
          <Button
            size="sm"
            className="h-8 gap-1"
            onClick={() => setThemKhachHangOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Thêm Khách Hàng
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1"
            onClick={() => setThemDaiLyOpen(true)}
          >
            <Building2 className="h-4 w-4" />
            Thêm Đại Lý
          </Button>
        </div>
      </div>

      {filters.length > 0 && (
        <FilterPanel
          filterCount={countActiveFilterValues(params.filters)}
          onClear={() => setFilters({})}
        >
          <CrudFilterFields
            filters={filters}
            value={params.filters}
            onChange={setFilters}
          />
        </FilterPanel>
      )}

      <BulkActionsBar count={selectedIds.length}>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 gap-1"
          onClick={() => setBulkDeleteOpen(true)}
          disabled={isBulkDeleting}
        >
          <Trash2 className="h-4 w-4" />
          Xóa
        </Button>
      </BulkActionsBar>

      {toolbar}

      <div
        className={cn(
          'transition-opacity duration-200',
          listQuery.isFetching && !listQuery.isLoading && 'opacity-60',
        )}
      >
        <CustomerMobileCards
          customers={result?.data ?? []}
          rowSelection={rowSelection}
          onSelectionChange={setRowSelection}
          onEdit={setEditRow}
        />

        <div className="hidden md:block">
          <DataTable
            tableId={config.resourceKey}
            columns={columns}
            data={result?.data ?? []}
            isLoading={listQuery.isLoading}
            isError={listQuery.isError}
            onRetry={() => listQuery.refetch()}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            emptyMessage="Chưa có Khách Hàng"
            sorting={
              params.sort
                ? [{ id: params.sort, desc: params.dir === 'desc' }]
                : []
            }
            onSortingChange={(updater) => {
              const next =
                typeof updater === 'function'
                  ? updater(
                      params.sort
                        ? [{ id: params.sort, desc: params.dir === 'desc' }]
                        : [],
                    )
                  : updater
              if (next.length > 0)
                setSort(next[0].id, next[0].desc ? 'desc' : 'asc')
            }}
            manualSorting
            manualPagination
            pagination={{
              pageIndex: params.page - 1,
              pageSize: params.pageSize,
            }}
            pageCount={
              result ? Math.ceil(result.total / result.pageSize) : undefined
            }
          />
        </div>
      </div>

      {result && (
        <DataTablePagination
          page={params.page}
          pageSize={params.pageSize}
          total={result.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={API_PAGE_SIZE_OPTIONS}
        />
      )}

      <CustomerEditorDialog
        open={editRow !== undefined}
        customer={editRow}
        onClose={() => setEditRow(undefined)}
        onSaved={() => setEditRow(undefined)}
      />

      <CrudDeleteDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        entityLabel={`${selectedIds.length} dòng đã chọn`}
        isPending={isBulkDeleting}
      />

      <ThemKhachHangModal
        open={themKhachHangOpen}
        onClose={() => setThemKhachHangOpen(false)}
        onCreated={() => setThemKhachHangOpen(false)}
      />
      <ThemDaiLyModal
        open={themDaiLyOpen}
        onClose={() => setThemDaiLyOpen(false)}
        onCreated={() => setThemDaiLyOpen(false)}
      />
    </div>
  )
}

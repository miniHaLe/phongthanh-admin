/**
 * Generic CRUD page host — toolbar + filter bar + DataTable + Sheet + DeleteDialog.
 * Driven entirely by CrudConfig<T>; no entity-specific code lives here.
 */
import { useState, useMemo, useCallback } from 'react'
import { useMatch } from 'react-router-dom'
import { Plus, RefreshCw, Trash2, FileSpreadsheet } from 'lucide-react'
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
import {
  failedBulkDeleteSelection,
  notifyBulkDeleteResult,
  selectedRowIds,
  useCrud,
} from '@/hooks/use-crud'
import { CrudSheet } from './CrudSheet'
import { CrudDeleteDialog } from './CrudDeleteDialog'
import type { CrudConfig } from '@/types/crud-types'
import { cn } from '@/lib/utils'
import {
  buildCrudColumnDescriptors,
  buildCrudColumns,
} from './build-crud-columns'
import { CrudFilterFields } from './crud-filter-fields'
import { countActiveFilterValues } from './crud-filter-values'
import { exportCurrentCrudPage } from './export-crud-rows'

interface CrudTablePageProps<T extends { id: string }> {
  config: CrudConfig<T>
  /** Route pattern used for enabled guard — pass ROUTES.xxx value */
  routePattern?: string
}

/** Derive a display label for delete dialog from the first string field. */
function getEntityLabel<T extends { id: string }>(
  row: T,
  config: CrudConfig<T>,
): string {
  // Try common label fields first
  const candidates = [
    'tenKH',
    'tenModel',
    'hoTen',
    'tenNhaKho',
    'tenNgan',
    'tenNhom',
    'tenHH',
    'tenNSX',
    'tenSP',
    'tenKhuVuc',
    'tenPhuongXa',
    'tenThoiHan',
    'tenPhiGiao',
    'tenDVT',
    'tenNhomSP',
    'tenLoi',
    'tenChiNhanh',
    'tenDangNhap',
    'maNV',
    'tenPhongBan',
    'tenChucVu',
    'tenMenu',
    'tenChucNang',
  ] as const
  for (const c of candidates) {
    const v = (row as Record<string, unknown>)[c]
    if (typeof v === 'string' && v) return v
  }
  // Fallback: first string column value
  for (const col of config.columns) {
    const v = (row as Record<string, unknown>)[String(col.key)]
    if (typeof v === 'string' && v) return v
  }
  return row.id
}

export function CrudTablePage<T extends { id: string }>({
  config,
  routePattern,
}: CrudTablePageProps<T>) {
  // Enable query only when the route is active (perf guard per spec risk note)
  const match = useMatch(routePattern ?? '*')
  const enabled = routePattern ? match !== null : true

  const crud = useCrud(config, enabled)
  const {
    params,
    setSearch,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDelete,
    isBulkDeleting,
  } = crud

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [editRow, setEditRow] = useState<T | undefined>()
  const [deleteRow, setDeleteRow] = useState<T | undefined>()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const result = listQuery.data
  const selectedIds = selectedRowIds(rowSelection)
  const activeFilterCount = useMemo(
    () => countActiveFilterValues(params.filters),
    [params.filters],
  )
  const hasActiveQuery = params.search.trim() !== '' || activeFilterCount > 0

  const columns = useMemo(
    () =>
      buildCrudColumns(config, params, {
        onEdit: (row) => {
          setEditRow(row)
          setSheetMode('edit')
          setSheetOpen(true)
        },
        onDelete: setDeleteRow,
      }),
    [config, params],
  )

  const columnDescriptors = useMemo(
    () => buildCrudColumnDescriptors(config),
    [config],
  )

  const handleSheetSubmit = useCallback(
    async (data: Partial<T>, saveAndNew?: boolean) => {
      if (sheetMode === 'create') {
        await createMutation.mutateAsync(data as Omit<T, 'id' | 'createdAt'>)
        if (!saveAndNew) {
          setSheetOpen(false)
          setEditRow(undefined)
        }
      } else if (editRow) {
        await updateMutation.mutateAsync({ id: editRow.id, data })
        setSheetOpen(false)
        setEditRow(undefined)
      }
    },
    [sheetMode, editRow, createMutation, updateMutation],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteRow) return
    deleteMutation.mutate(deleteRow.id, {
      onSuccess: () => setDeleteRow(undefined),
    })
  }, [deleteRow, deleteMutation])

  const handleBulkDeleteConfirm = useCallback(async () => {
    const result = await bulkDelete(selectedIds)
    setBulkDeleteOpen(false)
    setRowSelection(failedBulkDeleteSelection(result))
    notifyBulkDeleteResult(result)
  }, [selectedIds, bulkDelete])

  const handleExport = useCallback(() => {
    void exportCurrentCrudPage(config, result?.data ?? [])
  }, [result, config])

  const handleClearQuery = useCallback(() => {
    setSearch('')
    setFilters({})
  }, [setFilters, setSearch])

  const toolbar = (
    <DataTableToolbar
      searchValue={params.search}
      onSearchChange={setSearch}
      searchPlaceholder={`Tìm trong ${config.title}…`}
      right={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-11 gap-1 md:h-8"
            onClick={() => listQuery.refetch()}
            disabled={listQuery.isFetching}
            title="Làm mới"
          >
            <RefreshCw
              className={cn('h-4 w-4', listQuery.isFetching && 'animate-spin')}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
          <DataTableColumnConfig
            tableId={config.resourceKey}
            columns={columnDescriptors}
          />
          {config.export && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-1 md:h-8"
              onClick={handleExport}
              title="Xuất Excel (trang hiện tại)"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </Button>
          )}
          {config.addLabel !== false && (
            <Button
              size="sm"
              className="h-11 gap-1 md:h-8"
              onClick={() => {
                setEditRow(undefined)
                setSheetMode('create')
                setSheetOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              {config.addLabel ?? 'Thêm Mới'}
            </Button>
          )}
        </div>
      }
    />
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      {/* Page title — gives every CRUD leaf a consistent heading. Location
          context (section) comes from the section tab-strip / TopBar crumb. */}
      <h1 className="text-lg font-semibold">{config.title}</h1>

      {/* Filter bar */}
      {config.filters && config.filters.length > 0 && (
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          onSearch={() => void listQuery.refetch()}
        >
          <CrudFilterFields
            filters={config.filters}
            value={params.filters}
            onChange={setFilters}
          />
        </FilterPanel>
      )}

      {/* Bulk-actions bar (opt-in) */}
      {config.bulkDelete && (
        <BulkActionsBar count={selectedIds.length}>
          <Button
            variant="destructive"
            size="sm"
            className="h-11 gap-1 md:h-8"
            onClick={() => setBulkDeleteOpen(true)}
            disabled={isBulkDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>
        </BulkActionsBar>
      )}

      {/* Table */}
      <DataTable
        tableId={config.resourceKey}
        columns={columns}
        data={result?.data ?? []}
        isLoading={listQuery.isLoading}
        isFetching={listQuery.isFetching}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        {...(config.bulkDelete
          ? {
              enableRowSelection: true,
              rowSelection,
              onRowSelectionChange: setRowSelection,
              getRowId: (row: T) => row.id,
            }
          : {})}
        emptyMessage={
          hasActiveQuery ? 'Không tìm thấy kết quả' : `Chưa có ${config.title}`
        }
        emptyAction={
          hasActiveQuery ? (
            <Button size="sm" variant="outline" onClick={handleClearQuery}>
              Xóa tìm kiếm và bộ lọc
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditRow(undefined)
                setSheetMode('create')
                setSheetOpen(true)
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm {config.title}
            </Button>
          )
        }
        sorting={
          params.sort ? [{ id: params.sort, desc: params.dir === 'desc' }] : []
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
          if (next.length > 0) {
            setSort(next[0].id, next[0].desc ? 'desc' : 'asc')
          }
        }}
        manualSorting
        manualPagination
        pagination={{ pageIndex: params.page - 1, pageSize: params.pageSize }}
        pageCount={
          result ? Math.ceil(result.total / result.pageSize) : undefined
        }
        toolbar={toolbar}
      />

      {/* Pagination */}
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

      {/* Create / Edit Sheet */}
      <CrudSheet
        config={config}
        mode={sheetMode}
        initialData={editRow}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false)
          setEditRow(undefined)
        }}
        onSubmit={handleSheetSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <CrudDeleteDialog
        open={deleteRow !== undefined}
        onClose={() => setDeleteRow(undefined)}
        onConfirm={handleDeleteConfirm}
        entityLabel={deleteRow ? getEntityLabel(deleteRow, config) : ''}
        isPending={deleteMutation.isPending}
      />

      {/* Bulk Delete Dialog */}
      <CrudDeleteDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        entityLabel={`${selectedIds.length} dòng đã chọn`}
        isPending={isBulkDeleting}
      />
    </div>
  )
}

/**
 * Generic CRUD page host — toolbar + filter bar + DataTable + Sheet + DeleteDialog.
 * Driven entirely by CrudConfig<T>; no entity-specific code lives here.
 */
import { useState, useMemo, useCallback } from 'react'
import { useMatch } from 'react-router-dom'
import { Plus, RefreshCw, Pencil, Trash2, FileSpreadsheet } from 'lucide-react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  DataTableColumnConfig,
  BulkActionsBar,
  buildSelectionColumn,
  notify,
} from '@/components/shared'
import { useCrud } from '@/hooks/use-crud'
import { exportToXlsx } from '@/lib/export-xlsx'
import { CrudSheet } from './CrudSheet'
import { CrudDeleteDialog } from './CrudDeleteDialog'
import { CrudFilterBar } from './CrudFilterBar'
import type { CrudConfig, ColumnConfig } from '@/types/crud-types'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]

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
    'tenNhom',
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
  } = crud

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [editRow, setEditRow] = useState<T | undefined>()
  const [deleteRow, setDeleteRow] = useState<T | undefined>()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const result = listQuery.data
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  /** Build TanStack ColumnDef[] from ColumnConfig[]. */
  const columns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const cols: ColumnDef<T, unknown>[] = [
      ...(config.bulkDelete ? [buildSelectionColumn<T>()] : []),
      {
        id: 'stt',
        header: 'STT',
        cell: ({ row }) => (params.page - 1) * params.pageSize + row.index + 1,
        enableSorting: false,
        size: 56,
        meta: { sticky: true },
      },
      ...config.columns.map((col: ColumnConfig<T>): ColumnDef<T, unknown> => ({
        id: String(col.key),
        accessorKey: col.key as string,
        header: col.header,
        enableSorting: col.sortable ?? false,
        size: col.width,
        cell: col.renderCell
          ? ({ row }) =>
              col.renderCell!(
                (row.original as Record<string, unknown>)[
                  String(col.key)
                ] as T[keyof T],
                row.original,
              )
          : undefined,
      })),
      {
        id: '_actions',
        header: '',
        enableSorting: false,
        size: 88,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Chỉnh sửa"
              onClick={(e) => {
                e.stopPropagation()
                setEditRow(row.original)
                setSheetMode('edit')
                setSheetOpen(true)
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              title="Xóa"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteRow(row.original)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ]
    return cols
  }, [config.columns, config.bulkDelete, params.page, params.pageSize])

  const columnDescriptors = useMemo(
    () =>
      config.columns.map((c) => ({
        id: String(c.key),
        label: c.header,
      })),
    [config.columns],
  )

  const handleSheetSubmit = useCallback(
    (data: Partial<T>, saveAndNew?: boolean) => {
      if (sheetMode === 'create') {
        createMutation.mutate(data as Omit<T, 'id' | 'createdAt'>, {
          onSuccess: () => {
            // "Lưu & Thêm mới" keeps the sheet open (CrudSheet resets the form).
            if (!saveAndNew) {
              setSheetOpen(false)
              setEditRow(undefined)
            }
          },
        })
      } else if (editRow) {
        updateMutation.mutate(
          { id: editRow.id, data },
          {
            onSuccess: () => {
              setSheetOpen(false)
              setEditRow(undefined)
            },
          },
        )
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

  const handleBulkDeleteConfirm = useCallback(() => {
    for (const id of selectedIds) deleteMutation.mutate(id)
    setBulkDeleteOpen(false)
    setRowSelection({})
    notify.success(`Đã xóa ${selectedIds.length} dòng`)
  }, [selectedIds, deleteMutation])

  const handleExport = useCallback(() => {
    const rows = result?.data ?? []
    void exportToXlsx({
      filename: config.resourceKey,
      sheetName: config.title,
      columns: config.columns.map((c) => ({
        header: c.header,
        accessor: (row: T) =>
          String((row as Record<string, unknown>)[String(c.key)] ?? ''),
      })),
      rows,
    })
  }, [result, config])

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
            className="h-8 gap-1"
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
              className="h-8 gap-1"
              onClick={handleExport}
              title="Xuất ra Excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Xuất ra Excel</span>
            </Button>
          )}
          {config.addLabel !== false && (
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() => {
                setEditRow(undefined)
                setSheetMode('create')
                setSheetOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              {config.addLabel ?? 'Thêm'}
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
        <CrudFilterBar
          filters={config.filters}
          value={params.filters}
          onChange={setFilters}
          onClear={() => setFilters({})}
        />
      )}

      {/* Bulk-actions bar (opt-in) */}
      {config.bulkDelete && (
        <BulkActionsBar count={selectedIds.length}>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-1"
            onClick={() => setBulkDeleteOpen(true)}
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
        emptyMessage={`Chưa có ${config.title}`}
        emptyAction={
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
          pageSizeOptions={PAGE_SIZE_OPTIONS}
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
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

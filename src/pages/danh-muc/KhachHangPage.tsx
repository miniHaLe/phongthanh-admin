/**
 * Khách Hàng (CU1) — bespoke list (not the generic CrudTablePage) because the
 * reference has two distinct header create-flows (Thêm Khách Hàng / Thêm Đại
 * Lý) and an edit-only row action (no per-row delete — bulk-delete only).
 * Reuses the shared CrudTablePage primitives directly (useCrud, DataTable,
 * CrudFilterBar, bulk-delete, selection column) for consistency with every
 * other catalog list without touching components/crud/**.
 */
import { useMemo, useState, type ReactElement } from 'react'
import { UserPlus, Building2, Pencil, Trash2, FileSpreadsheet } from 'lucide-react'
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
import { CrudFilterBar } from '@/components/crud/CrudFilterBar'
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog'
import { CrudSheet } from '@/components/crud/CrudSheet'
import { useCrud } from '@/hooks/use-crud'
import { khachHangConfig } from '@/config/crud-configs/khach-hang.config'
import { exportToXlsx } from '@/lib/export-xlsx'
import type { KhachHang } from '@/types/masterdata-types'
import type { ColumnConfig } from '@/types/crud-types'
import { ThemKhachHangModal } from '@/features/customer/them-khach-hang-modal'
import { ThemDaiLyModal } from '@/features/customer/them-dai-ly-modal'

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]

export default function KhachHangPage(): ReactElement {
  const config = khachHangConfig
  const crud = useCrud(config, true)
  const {
    params,
    setSearch,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    listQuery,
    updateMutation,
    deleteMutation,
  } = crud

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [editRow, setEditRow] = useState<KhachHang | undefined>()
  const [themKhachHangOpen, setThemKhachHangOpen] = useState(false)
  const [themDaiLyOpen, setThemDaiLyOpen] = useState(false)

  const result = listQuery.data
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const columns = useMemo<ColumnDef<KhachHang, unknown>[]>(() => {
    const cols: ColumnDef<KhachHang, unknown>[] = [
      {
        id: 'stt',
        header: 'STT',
        cell: ({ row }) => (params.page - 1) * params.pageSize + row.index + 1,
        enableSorting: false,
        size: 56,
      },
      buildSelectionColumn<KhachHang>(),
      ...config.columns.map((col: ColumnConfig<KhachHang>): ColumnDef<KhachHang, unknown> => ({
        id: String(col.key),
        accessorKey: col.key as string,
        header: col.header,
        enableSorting: col.sortable ?? false,
        size: col.width,
        cell: col.renderCell
          ? ({ row }) =>
              col.renderCell!(
                (row.original as unknown as Record<string, unknown>)[String(col.key)] as KhachHang[keyof KhachHang],
                row.original,
              )
          : undefined,
      })),
      {
        id: '_actions',
        header: '',
        enableSorting: false,
        size: 60,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Chỉnh sửa"
            onClick={(e) => {
              e.stopPropagation()
              setEditRow(row.original)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ]
    return cols
  }, [config.columns, params.page, params.pageSize])

  const columnDescriptors = useMemo(
    () => config.columns.map((c) => ({ id: String(c.key), label: c.header })),
    [config.columns],
  )

  function handleBulkDeleteConfirm() {
    for (const id of selectedIds) deleteMutation.mutate(id)
    setBulkDeleteOpen(false)
    setRowSelection({})
    notify.success(`Đã xóa ${selectedIds.length} dòng`)
  }

  function handleExport() {
    const rows = result?.data ?? []
    void exportToXlsx({
      filename: config.resourceKey,
      sheetName: config.title,
      columns: config.columns.map((c) => ({
        header: c.header,
        accessor: (row: KhachHang) => String((row as unknown as Record<string, unknown>)[String(c.key)] ?? ''),
      })),
      rows,
    })
  }

  const toolbar = (
    <DataTableToolbar
      searchValue={params.search}
      onSearchChange={setSearch}
      searchPlaceholder="Tìm trong Khách Hàng…"
      right={
        <div className="flex items-center gap-2">
          <DataTableColumnConfig tableId={config.resourceKey} columns={columnDescriptors} />
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport} title="Xuất Excel File">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel File</span>
          </Button>
        </div>
      }
    />
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{config.title}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => setThemKhachHangOpen(true)}>
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

      {config.filters && (
        <CrudFilterBar
          filters={config.filters}
          value={params.filters}
          onChange={setFilters}
          onClear={() => setFilters({})}
        />
      )}

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
        sorting={params.sort ? [{ id: params.sort, desc: params.dir === 'desc' }] : []}
        onSortingChange={(updater) => {
          const next =
            typeof updater === 'function'
              ? updater(params.sort ? [{ id: params.sort, desc: params.dir === 'desc' }] : [])
              : updater
          if (next.length > 0) setSort(next[0].id, next[0].desc ? 'desc' : 'asc')
        }}
        manualPagination
        pagination={{ pageIndex: params.page - 1, pageSize: params.pageSize }}
        pageCount={result ? Math.ceil(result.total / result.pageSize) : undefined}
        toolbar={toolbar}
      />

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

      <CrudSheet
        config={config}
        mode="edit"
        initialData={editRow}
        open={editRow !== undefined}
        onClose={() => setEditRow(undefined)}
        onSubmit={(data) => {
          if (!editRow) return
          updateMutation.mutate(
            { id: editRow.id, data },
            { onSuccess: () => setEditRow(undefined) },
          )
        }}
        isPending={updateMutation.isPending}
      />

      <CrudDeleteDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        entityLabel={`${selectedIds.length} dòng đã chọn`}
        isPending={deleteMutation.isPending}
      />

      <ThemKhachHangModal
        open={themKhachHangOpen}
        onClose={() => setThemKhachHangOpen(false)}
        onCreated={() => listQuery.refetch()}
      />
      <ThemDaiLyModal
        open={themDaiLyOpen}
        onClose={() => setThemDaiLyOpen(false)}
        onCreated={() => listQuery.refetch()}
      />
    </div>
  )
}

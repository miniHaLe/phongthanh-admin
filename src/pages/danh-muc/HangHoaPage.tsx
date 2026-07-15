/**
 * Hàng Hóa (C5) — full-width list (not master-detail). Create/edit route to
 * the dedicated full-page editor (C5b, /danh-muc/hang-hoa/tao-moi|:id/sua)
 * rather than the generic Sheet; row actions are edit + In Barcode (opens a
 * print window). Reuses the shared CRUD primitives (useCrud, DataTable,
 * FilterPanel, bulk-delete, selection column) while retaining its page-level
 * editor and barcode actions.
 */
import { useMemo, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Printer, Trash2, FileSpreadsheet } from 'lucide-react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  DataTableColumnConfig,
  BulkActionsBar,
  FilterPanel,
  buildSelectionColumn,
  notify,
} from '@/components/shared'
import { CrudFilterFields } from '@/components/crud/crud-filter-fields'
import { countActiveFilterValues } from '@/components/crud/crud-filter-values'
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog'
import { useCrud } from '@/hooks/use-crud'
import { hangHoaConfig } from '@/config/crud-configs/hang-hoa.config'
import { ROUTES } from '@/constants/routes'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import type { HangHoa } from '@/types/masterdata-types'
import type { ColumnConfig } from '@/types/crud-types'
import { openPrintWindow } from '@/components/print/print-window'
import { PrintLayout } from '@/components/print/print-layout'
import { getVisibleRowNumber } from '@/components/shared/data-table/visible-row-number'

import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'

function printBarcode(row: HangHoa): void {
  void openPrintWindow(
    `Tem hàng hóa — ${row.maHH}`,
    <PrintLayout title="TEM HÀNG HÓA">
      <table>
        <tbody>
          <tr>
            <td>Mã hàng</td>
            <td>{row.maHH}</td>
          </tr>
          <tr>
            <td>Tên hàng</td>
            <td>{row.tenHH}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export default function HangHoaPage(): ReactElement {
  const navigate = useNavigate()
  const config = hangHoaConfig
  const crud = useCrud(config, true)
  const {
    params,
    setSearch,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    listQuery,
    deleteMutation,
  } = crud

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteRow, setDeleteRow] = useState<HangHoa | undefined>()
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const result = listQuery.data
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const columns = useMemo<ColumnDef<HangHoa, unknown>[]>(() => {
    const cols: ColumnDef<HangHoa, unknown>[] = [
      buildSelectionColumn<HangHoa>(),
      {
        id: 'stt',
        header: 'STT',
        cell: ({ row, table }) =>
          getVisibleRowNumber(table, row, (params.page - 1) * params.pageSize),
        enableSorting: false,
        size: 56,
      },
      ...config.columns.map(
        (col: ColumnConfig<HangHoa>): ColumnDef<HangHoa, unknown> => ({
          id: String(col.key),
          accessorKey: col.key as string,
          header: col.header,
          enableSorting: col.sortable ?? false,
          size: col.width,
          cell: col.renderCell
            ? ({ row }) =>
                col.renderCell!(
                  (row.original as unknown as Record<string, unknown>)[
                    String(col.key)
                  ] as HangHoa[keyof HangHoa],
                  row.original,
                )
            : undefined,
        }),
      ),
      {
        id: '_actions',
        header: '',
        enableSorting: false,
        size: 96,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Chỉnh sửa"
              onClick={(e) => {
                e.stopPropagation()
                navigate(ROUTES.catalogGoodsEdit(row.original.id))
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="In Barcode"
              onClick={(e) => {
                e.stopPropagation()
                printBarcode(row.original)
              }}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ]
    return cols
  }, [config.columns, navigate, params.page, params.pageSize])

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
    void exportListXlsx({
      filename: config.resourceKey,
      sheetName: config.title,
      columns: config.columns.map((c) => ({
        header: c.header,
        accessor: (row: HangHoa) =>
          String(
            (row as unknown as Record<string, unknown>)[String(c.key)] ?? '',
          ),
      })),
      rows,
    })
  }

  const toolbar = (
    <DataTableToolbar
      searchValue={params.search}
      onSearchChange={setSearch}
      searchPlaceholder="Tìm trong Hàng Hóa…"
      right={
        <div className="flex items-center gap-2">
          <DataTableColumnConfig
            tableId={config.resourceKey}
            columns={columnDescriptors}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={handleExport}
            title="Xuất Excel"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1"
            onClick={() => navigate(ROUTES.catalogGoodsCreate)}
          >
            <Plus className="h-4 w-4" />
            Thêm hàng hóa
          </Button>
        </div>
      }
    />
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <h1 className="text-lg font-semibold">{config.title}</h1>

      {config.filters && (
        <FilterPanel
          filterCount={countActiveFilterValues(params.filters)}
          onClear={() => setFilters({})}
        >
          <CrudFilterFields
            filters={config.filters}
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
        emptyMessage="Chưa có Hàng Hóa"
        emptyAction={
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(ROUTES.catalogGoodsCreate)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Thêm hàng hóa
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
          if (next.length > 0)
            setSort(next[0].id, next[0].desc ? 'desc' : 'asc')
        }}
        manualPagination
        pagination={{ pageIndex: params.page - 1, pageSize: params.pageSize }}
        pageCount={
          result ? Math.ceil(result.total / result.pageSize) : undefined
        }
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

      <CrudDeleteDialog
        open={deleteRow !== undefined}
        onClose={() => setDeleteRow(undefined)}
        onConfirm={() => {
          if (!deleteRow) return
          deleteMutation.mutate(deleteRow.id, {
            onSuccess: () => setDeleteRow(undefined),
          })
        }}
        entityLabel={deleteRow?.tenHH ?? ''}
        isPending={deleteMutation.isPending}
      />

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

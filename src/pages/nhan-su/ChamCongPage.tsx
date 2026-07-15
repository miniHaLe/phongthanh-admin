/**
 * Chấm Công — exception-record CRUD (Nghỉ / Nghỉ nữa ngày / Đi trễ / Tăng ca /
 * Về sớm + Loại trừ lương). Hand-composed rather than routed through
 * CrudTablePage: 4 of the 12 verified columns (Tên NV / Giới tính / Chức danh
 * / Chi nhánh) are all *derived* from the same `nhanVienId` field, which
 * would give CrudTablePage's column builder duplicate column ids — so this
 * page builds its own DataTable columns from `chamCongConfig` metadata while
 * reusing `CrudSheet` (create/edit) + `CrudDeleteDialog` for the mutations.
 */
import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  BulkActionsBar,
  FilterPanel,
  buildSelectionColumn,
  notify,
} from '@/components/shared'
import { useCrud } from '@/hooks/use-crud'
import { CrudSheet } from '@/components/crud/CrudSheet'
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog'
import { CrudFilterFields } from '@/components/crud/crud-filter-fields'
import { countActiveFilterValues } from '@/components/crud/crud-filter-values'
import { formatDate } from '@/lib/format'
import { chamCongConfig } from '@/config/crud-configs/cham-cong.config'
import { NHAN_VIEN_ROWS } from '@/mock/masterdata'
import { CHUC_VU_ROWS } from '@/mock/masterdata/chuc-vu.mock'
import { KY } from '@/mock/seed/ky'
import { LOAI_CHAM, LOAI_TRU } from '@/mock/seed/cham-cong'
import type { ChamCongRecord } from '@/domains/hr/types'
import { getVisibleRowNumber } from '@/components/shared/data-table/visible-row-number'
import { useLookup } from '@/hooks/use-lookup'

import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'

function nv(id: string) {
  return NHAN_VIEN_ROWS.find((r) => r.id === id)
}
const KY_LABEL = (id: string) => KY.find((k) => k.id === id)?.ten ?? id
const LOAI_CHAM_LABEL = (v: number) =>
  LOAI_CHAM.find((l) => l.id === v)?.ten ?? String(v)
const LOAI_TRU_LABEL = (v: number) =>
  LOAI_TRU.find((l) => l.id === v)?.ten ?? String(v)

export default function ChamCongPage() {
  const crud = useCrud(chamCongConfig)
  const { byId: chiNhanhById } = useLookup('chi-nhanh')
  const {
    params,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  } = crud
  const result = listQuery.data

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [editRow, setEditRow] = useState<ChamCongRecord | undefined>()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const columns = useMemo<ColumnDef<ChamCongRecord, unknown>[]>(
    () => [
      buildSelectionColumn<ChamCongRecord>(),
      {
        id: 'stt',
        header: 'STT',
        cell: ({ row, table }) =>
          getVisibleRowNumber(table, row, (params.page - 1) * params.pageSize),
        size: 56,
      },
      {
        id: 'tenNV',
        header: 'Tên NV',
        size: 180,
        cell: ({ row }) => {
          const r = nv(row.original.nhanVienId)
          return r ? `${r.maNV} - ${r.hoTen}` : row.original.nhanVienId
        },
      },
      {
        id: 'gioiTinh',
        header: 'Giới tính',
        size: 90,
        cell: ({ row }) => {
          const r = nv(row.original.nhanVienId)
          return r?.gioiTinh === undefined ? '—' : r.gioiTinh ? 'Nam' : 'Nữ'
        },
      },
      {
        id: 'chucDanh',
        header: 'Chức danh',
        size: 170,
        cell: ({ row }) => {
          const r = nv(row.original.nhanVienId)
          return (
            CHUC_VU_ROWS.find((c) => c.id === r?.chucVuId)?.tenChucVu ?? '—'
          )
        },
      },
      {
        id: 'chiNhanh',
        header: 'Chi nhánh',
        size: 150,
        cell: ({ row }) => {
          const r = nv(row.original.nhanVienId)
          return r?.chiNhanhId
            ? (chiNhanhById.get(r.chiNhanhId)?.tenChiNhanh ?? '—')
            : '—'
        },
      },
      {
        id: 'loaiCham',
        header: 'Loại chấm',
        size: 130,
        cell: ({ row }) => LOAI_CHAM_LABEL(row.original.loaiCham),
      },
      {
        id: 'chamCong',
        header: 'Chấm công',
        size: 110,
        cell: ({ row }) => `${row.original.soLuong} (${row.original.donVi})`,
      },
      {
        id: 'ngayCham',
        header: 'Ngày chấm công',
        size: 130,
        cell: ({ row }) => formatDate(row.original.ngayCham),
      },
      {
        id: 'createdAt',
        header: 'Ngày tạo',
        size: 130,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'kyId',
        header: 'Kỳ',
        size: 90,
        cell: ({ row }) => KY_LABEL(row.original.kyId),
      },
      {
        id: 'loaiTru',
        header: 'Loại trừ',
        size: 130,
        cell: ({ row }) => LOAI_TRU_LABEL(row.original.loaiTru),
      },
      {
        id: '_actions',
        header: 'Chọn',
        size: 70,
        cell: ({ row }) => (
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
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chiNhanhById, params.page, params.pageSize],
  )

  function handleSheetSubmit(data: Partial<ChamCongRecord>) {
    if (sheetMode === 'create') {
      createMutation.mutate(data as Omit<ChamCongRecord, 'id' | 'createdAt'>, {
        onSuccess: () => {
          setSheetOpen(false)
          setEditRow(undefined)
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
  }

  function handleBulkDeleteConfirm() {
    for (const id of selectedIds) deleteMutation.mutate(id)
    setBulkDeleteOpen(false)
    setRowSelection({})
    notify.success(`Đã xóa ${selectedIds.length} dòng`)
  }

  return (
    <div className="space-y-3 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Chấm Công</h1>

      <FilterPanel
        filterCount={countActiveFilterValues(params.filters)}
        onClear={() => setFilters({})}
      >
        <CrudFilterFields
          filters={chamCongConfig.filters ?? []}
          value={params.filters}
          onChange={setFilters}
        />
      </FilterPanel>

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
        tableId="cham-cong"
        columns={columns}
        data={result?.data ?? []}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(r) => r.id}
        emptyMessage="Chưa có dữ liệu chấm công"
        manualPagination
        pagination={{ pageIndex: params.page - 1, pageSize: params.pageSize }}
        pageCount={
          result ? Math.ceil(result.total / result.pageSize) : undefined
        }
        toolbar={
          <DataTableToolbar
            searchValue={params.search}
            onSearchChange={setSearch}
            searchPlaceholder="Tên Nhân Viên…"
            right={
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
                Thêm
              </Button>
            }
          />
        }
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
        config={chamCongConfig}
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

/**
 * Menu (RoleMenu) — menu-item list (left) + persistent "Thông tin danh mục"
 * form (right) embedding the 202-checkbox function-permission matrix.
 * Hand-composed rather than driven through CrudTablePage/CrudSheet, mirroring
 * NhomQuyenPage's rationale: the reference form is a persistent side-by-side
 * panel with an attached function-permission tree the generic FieldConfig
 * schema has no slot for.
 */
import { useCallback, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  BulkActionsBar,
  buildSelectionColumn,
  notify,
} from '@/components/shared'
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog'
import { useCrud } from '@/hooks/use-crud'
import { menuConfig } from '@/config/crud-configs/menu.config'
import { MENU_ROWS } from '@/mock/masterdata/menu.mock'
import type { Menu } from '@/types/masterdata-types'
import { usePermissionStore } from '@/store/permission-store'
import { FunctionPermissionMatrix } from '@/features/permissions/function-permission-matrix'

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]
const UNSET = '__all__'

/** Fresh per-mount draft id so an unsaved create-mode matrix selection
 * doesn't collide with any other draft still open elsewhere. */
let draftCounter = 0
function makeDraftId(): string {
  draftCounter += 1
  return `menu-draft-${draftCounter}`
}

interface FormState {
  id?: string
  tenMenu: string
  duongDan: string
  icon: string
  thuTu: string
  parentId: string
}

const EMPTY_FORM: FormState = {
  tenMenu: '',
  duongDan: '',
  icon: '',
  thuTu: '',
  parentId: '',
}

function menuLabel(id: string | undefined): string {
  if (!id) return '—'
  return MENU_ROWS.find((r) => r.id === id)?.tenMenu ?? id
}

export default function MenuPage() {
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
  } = useCrud(menuConfig)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [draftId, setDraftId] = useState<string>(() => makeDraftId())
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteRow, setDeleteRow] = useState<Menu | undefined>()
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const copyFunctionChecked = usePermissionStore((s) => s.copyFunctionChecked)

  const result = listQuery.data
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const parentFilterValue = (params.filters.parentId as string) ?? ''

  /** menuId currently bound to the matrix — the record id when editing, else the draft id. */
  const activeMenuId = form.id ?? draftId

  function resetForm() {
    setForm(EMPTY_FORM)
    setDraftId(makeDraftId())
  }

  function loadRowIntoForm(row: Menu) {
    setForm({
      id: row.id,
      tenMenu: row.tenMenu,
      duongDan: row.duongDan,
      icon: row.icon ?? '',
      thuTu: String(row.thuTu),
      parentId: row.parentId ?? '',
    })
  }

  const handleSubmit = useCallback(
    (saveAndNew: boolean) => {
      if (!form.tenMenu.trim() || !form.duongDan.trim() || !form.thuTu.trim()) {
        notify.error('Vui lòng nhập Tên danh mục, Link và Số thứ tự')
        return
      }

      const payload = {
        tenMenu: form.tenMenu,
        duongDan: form.duongDan,
        icon: form.icon || undefined,
        thuTu: Number(form.thuTu),
        parentId: form.parentId || undefined,
      }

      if (form.id) {
        updateMutation.mutate(
          { id: form.id, data: payload },
          { onSuccess: () => resetForm() },
        )
        return
      }

      createMutation.mutate(payload as Omit<Menu, 'id' | 'createdAt'>, {
        onSuccess: (created) => {
          // Migrate the draft-id matrix selections onto the newly saved record id.
          copyFunctionChecked(draftId, created.id)
          if (saveAndNew) {
            setForm(EMPTY_FORM)
            setDraftId(makeDraftId())
          } else {
            resetForm()
          }
        },
      })
    },
    [form, createMutation, updateMutation, copyFunctionChecked, draftId],
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

  const columns = useMemo<ColumnDef<Menu, unknown>[]>(
    () => [
      buildSelectionColumn<Menu>(),
      {
        id: 'stt',
        header: '##',
        cell: ({ row }) => (params.page - 1) * params.pageSize + row.index + 1,
        enableSorting: false,
        size: 48,
      },
      {
        id: 'tenMenu',
        accessorKey: 'tenMenu',
        header: 'Tên danh mục',
        size: 200,
      },
      {
        id: 'parentId',
        header: 'Danh mục cha',
        size: 160,
        cell: ({ row }) => menuLabel(row.original.parentId),
      },
      {
        id: 'icon',
        accessorKey: 'icon',
        header: 'Icon',
        size: 120,
        cell: ({ row }) => row.original.icon ?? '—',
      },
      {
        id: 'duongDan',
        accessorKey: 'duongDan',
        header: 'Link',
        size: 200,
      },
      {
        id: 'thuTu',
        accessorKey: 'thuTu',
        header: 'Number',
        size: 90,
      },
      {
        id: '_actions',
        header: 'Chọn',
        size: 72,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Chỉnh sửa"
            onClick={(e) => {
              e.stopPropagation()
              loadRowIntoForm(row.original)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [params.page, params.pageSize],
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Menu</h1>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Left pane: menu-item list */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="space-y-1">
              <Label htmlFor="menu-filter-parent">Danh mục cha</Label>
              <Select
                value={parentFilterValue || UNSET}
                onValueChange={(v) =>
                  setFilters({ parentId: v === UNSET ? undefined : v })
                }
              >
                <SelectTrigger
                  id="menu-filter-parent"
                  className="h-8 w-56 text-sm"
                  aria-label="Danh mục cha"
                >
                  <SelectValue placeholder="Tất cả danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Tất cả danh mục cha</SelectItem>
                  {MENU_ROWS.filter((r) => !r.parentId).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.tenMenu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedIds.length > 0 && (
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

          <DataTable
            tableId="menu"
            columns={columns}
            data={result?.data ?? []}
            isLoading={listQuery.isLoading}
            isError={listQuery.isError}
            onRetry={() => listQuery.refetch()}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            emptyMessage="Chưa có Menu"
            manualPagination
            pagination={{ pageIndex: params.page - 1, pageSize: params.pageSize }}
            pageCount={
              result ? Math.ceil(result.total / result.pageSize) : undefined
            }
            toolbar={
              <DataTableToolbar
                searchValue={params.search}
                onSearchChange={setSearch}
                searchPlaceholder="Tìm trong Menu…"
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
        </div>

        {/* Right pane: persistent create/edit form */}
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">Thông tin danh mục</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="menu-form-parent">Danh mục cha</Label>
              <Select
                value={form.parentId || UNSET}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, parentId: v === UNSET ? '' : v }))
                }
              >
                <SelectTrigger
                  id="menu-form-parent"
                  aria-label="Danh mục cha"
                >
                  <SelectValue placeholder="Không có (mục gốc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Không có (mục gốc)</SelectItem>
                  {MENU_ROWS.filter((r) => r.id !== form.id).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.tenMenu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="menu-form-ten">Tên danh mục</Label>
              <Input
                id="menu-form-ten"
                value={form.tenMenu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tenMenu: e.target.value }))
                }
                placeholder="Tên danh mục"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="menu-form-link">Link</Label>
              <Input
                id="menu-form-link"
                value={form.duongDan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duongDan: e.target.value }))
                }
                placeholder="/duong-dan"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="menu-form-icon">Class icon</Label>
              <Input
                id="menu-form-icon"
                value={form.icon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, icon: e.target.value }))
                }
                placeholder="fa fa-home"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="menu-form-thutu">Số thứ tự</Label>
              <Input
                id="menu-form-thutu"
                type="number"
                value={form.thuTu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thuTu: e.target.value }))
                }
                placeholder="Số thứ tự"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Danh sách quyền</Label>
            <FunctionPermissionMatrix menuId={activeMenuId} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Hủy
            </Button>
            {!form.id && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSubmit(true)}
                disabled={createMutation.isPending}
              >
                Lưu & Thêm mới
              </Button>
            )}
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Lưu
            </Button>
          </div>
        </div>
      </div>

      {/* Per-row delete */}
      <CrudDeleteDialog
        open={deleteRow !== undefined}
        onClose={() => setDeleteRow(undefined)}
        onConfirm={handleDeleteConfirm}
        entityLabel={deleteRow?.tenMenu ?? ''}
        isPending={deleteMutation.isPending}
      />

      {/* Bulk delete */}
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

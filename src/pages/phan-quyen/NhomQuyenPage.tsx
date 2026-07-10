/**
 * Nhóm Quyền — role-group list (left) + persistent "Thông tin nhóm quyền"
 * form (right) embedding the menu-permission tree. Hand-composed rather than
 * driven through CrudTablePage/CrudSheet: the reference form is a persistent
 * side-by-side panel (not a drawer) and needs to render the ~50-node
 * MenuPermissionTree alongside Mã/Nhóm quyền, which the generic FieldConfig
 * schema has no slot for.
 */
import { useCallback, useMemo, useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { nhomQuyenConfig } from '@/config/crud-configs/nhom-quyen.config'
import type { NhomQuyen } from '@/types/masterdata-types'
import { usePermissionStore } from '@/store/permission-store'
import { MenuPermissionTree } from '@/features/permissions/menu-permission-tree'

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]

/** Fresh per-mount draft id so an unsaved create-mode tree selection doesn't
 * collide with any other draft still open elsewhere. */
let draftCounter = 0
function makeDraftId(): string {
  draftCounter += 1
  return `nq-draft-${draftCounter}`
}

interface FormState {
  id?: string
  maNhom: string
  tenNhom: string
}

const EMPTY_FORM: FormState = { maNhom: '', tenNhom: '' }

export default function NhomQuyenPage() {
  const {
    params,
    setSearch,
    setPage,
    setPageSize,
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useCrud(nhomQuyenConfig)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [draftId, setDraftId] = useState<string>(() => makeDraftId())
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteRow, setDeleteRow] = useState<NhomQuyen | undefined>()
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [viewRow, setViewRow] = useState<NhomQuyen | undefined>()

  const copyMenuChecked = usePermissionStore((s) => s.copyMenuChecked)

  const result = listQuery.data
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  /** roleId currently bound to the tree — the record id when editing, else the draft id. */
  const activeRoleId = form.id ?? draftId

  function resetForm() {
    setForm(EMPTY_FORM)
    setDraftId(makeDraftId())
  }

  function loadRowIntoForm(row: NhomQuyen) {
    setForm({ id: row.id, maNhom: row.maNhom, tenNhom: row.tenNhom })
  }

  const handleSubmit = useCallback(
    (saveAndNew: boolean) => {
      if (!form.maNhom.trim() || !form.tenNhom.trim()) {
        notify.error('Vui lòng nhập Mã và Nhóm quyền')
        return
      }

      if (form.id) {
        updateMutation.mutate(
          { id: form.id, data: { maNhom: form.maNhom, tenNhom: form.tenNhom } },
          { onSuccess: () => resetForm() },
        )
        return
      }

      createMutation.mutate(
        { maNhom: form.maNhom, tenNhom: form.tenNhom } as Omit<
          NhomQuyen,
          'id' | 'createdAt'
        >,
        {
          onSuccess: (created) => {
            // Migrate the draft-id tree selections onto the newly saved record id.
            copyMenuChecked(draftId, created.id)
            if (saveAndNew) {
              setForm(EMPTY_FORM)
              setDraftId(makeDraftId())
            } else {
              resetForm()
            }
          },
        },
      )
    },
    [form, createMutation, updateMutation, copyMenuChecked, draftId],
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

  const columns = useMemo<ColumnDef<NhomQuyen, unknown>[]>(
    () => [
      buildSelectionColumn<NhomQuyen>(),
      {
        id: 'stt',
        header: '##',
        cell: ({ row }) => (params.page - 1) * params.pageSize + row.index + 1,
        enableSorting: false,
        size: 48,
      },
      {
        id: 'maNhom',
        accessorKey: 'maNhom',
        header: 'Mã',
        size: 110,
      },
      {
        id: 'tenNhom',
        accessorKey: 'tenNhom',
        header: 'Nhóm quyền',
        size: 220,
      },
      {
        id: '_actions',
        header: 'Chọn',
        size: 96,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Xem quyền"
              onClick={(e) => {
                e.stopPropagation()
                setViewRow(row.original)
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
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
    ],
    [params.page, params.pageSize],
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Nhóm Quyền</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left pane: role-group list */}
        <div className="space-y-3">
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
            tableId="nhom-quyen"
            columns={columns}
            data={result?.data ?? []}
            isLoading={listQuery.isLoading}
            isError={listQuery.isError}
            onRetry={() => listQuery.refetch()}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            emptyMessage="Chưa có Nhóm Quyền"
            manualPagination
            pagination={{ pageIndex: params.page - 1, pageSize: params.pageSize }}
            pageCount={
              result ? Math.ceil(result.total / result.pageSize) : undefined
            }
            toolbar={
              <DataTableToolbar
                searchValue={params.search}
                onSearchChange={setSearch}
                searchPlaceholder="Tìm trong Nhóm Quyền…"
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
          <h2 className="text-base font-semibold">Thông tin nhóm quyền</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="nq-ma">Mã</Label>
              <Input
                id="nq-ma"
                value={form.maNhom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maNhom: e.target.value }))
                }
                placeholder="Mã"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nq-ten">Nhóm quyền</Label>
              <Input
                id="nq-ten"
                value={form.tenNhom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tenNhom: e.target.value }))
                }
                placeholder="Nhóm quyền"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Danh sách quyền menu</Label>
            <MenuPermissionTree roleId={activeRoleId} />
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

      {/* View-only granted-permissions dialog */}
      <Dialog
        open={viewRow !== undefined}
        onOpenChange={(o) => {
          if (!o) setViewRow(undefined)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Quyền menu — {viewRow?.tenNhom ?? ''}
            </DialogTitle>
          </DialogHeader>
          {viewRow && <MenuPermissionTree roleId={viewRow.id} readOnly />}
        </DialogContent>
      </Dialog>

      {/* Per-row delete */}
      <CrudDeleteDialog
        open={deleteRow !== undefined}
        onClose={() => setDeleteRow(undefined)}
        onConfirm={handleDeleteConfirm}
        entityLabel={deleteRow?.tenNhom ?? ''}
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

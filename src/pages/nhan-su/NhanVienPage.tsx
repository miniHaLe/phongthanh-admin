/**
 * Nhân Viên — the reference list is hand-composed (not CrudTablePage) because
 * two behaviors CrudTablePage's generic row-actions template can't express:
 * the Khóa/Mở khóa lock-toggle action (a mutation, not edit/delete) and
 * routing row-edit to the full-page employee editor instead of opening a
 * Sheet. Column/field metadata still lives in nhan-vien.config.ts so the spec
 * tests + filter/sort/pagination state (via useCrud) stay in one place.
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Lock, Unlock, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  buildSelectionColumn,
} from '@/components/shared'
import { formatDate } from '@/lib/format'
import { useCrud } from '@/hooks/use-crud'
import { CrudFilterBar } from '@/components/crud/CrudFilterBar'
import { nhanVienConfig } from '@/config/crud-configs/nhan-vien.config'
import { ROUTES } from '@/constants/routes'
import type { NhanVien } from '@/types/masterdata-types'
import { PHONG_BAN_ROWS } from '@/mock/masterdata/phong-ban.mock'

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]

export default function NhanVienPage() {
  const navigate = useNavigate()
  const crud = useCrud(nhanVienConfig)
  const {
    params,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
    listQuery,
    updateMutation,
  } = crud
  const result = listQuery.data

  function toggleLock(row: NhanVien) {
    updateMutation.mutate({ id: row.id, data: { locked: !row.locked } })
  }

  const columns = useMemo<ColumnDef<NhanVien, unknown>[]>(
    () => [
      buildSelectionColumn<NhanVien>(),
      {
        id: 'stt',
        header: 'STT',
        cell: ({ row }) => (params.page - 1) * params.pageSize + row.index + 1,
        size: 56,
      },
      {
        id: 'photo',
        header: 'Hình',
        size: 56,
        cell: ({ row }) => (
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={row.original.photo} alt={row.original.hoTen} />
            <AvatarFallback className="rounded-md text-xs">
              {row.original.hoTen.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        ),
      },
      { accessorKey: 'maNV', header: 'Mã NV', size: 100 },
      { accessorKey: 'hoTen', header: 'Tên NV', size: 200 },
      {
        id: 'phongBanId',
        header: 'Phòng',
        size: 150,
        cell: ({ row }) =>
          PHONG_BAN_ROWS.find((p) => p.id === row.original.phongBanId)
            ?.tenPhongBan ?? '—',
      },
      {
        id: 'gioiTinh',
        header: 'Giới tính',
        size: 90,
        cell: ({ row }) => (row.original.gioiTinh ? 'Nam' : 'Nữ'),
      },
      {
        id: 'ngaySinh',
        header: 'Ngày sinh',
        size: 110,
        cell: ({ row }) => formatDate(row.original.ngaySinh),
      },
      { accessorKey: 'soDienThoai', header: 'Điện thoại', size: 120 },
      {
        id: 'locked',
        header: 'Khóa',
        size: 80,
        cell: ({ row }) => {
          const locked = Boolean(row.original.locked)
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant={locked ? 'default' : 'destructive'}
                    className={
                      locked
                        ? 'h-7 w-7 bg-green-600 hover:bg-green-700'
                        : 'h-7 w-7'
                    }
                    data-lock={locked ? 'True' : 'False'}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLock(row.original)
                    }}
                  >
                    {locked ? (
                      <Unlock className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{locked ? 'Mở khóa' : 'Khóa'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
      {
        id: '_actions',
        header: '',
        size: 60,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Chỉnh sửa"
            onClick={(e) => {
              e.stopPropagation()
              navigate(ROUTES.hrEmployeeEdit(row.original.id))
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.page, params.pageSize, navigate],
  )

  return (
    <div className="space-y-3 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Nhân Viên</h1>

      <CrudFilterBar
        filters={nhanVienConfig.filters ?? []}
        value={params.filters}
        onChange={setFilters}
        onClear={() => setFilters({})}
      />

      <DataTable
        tableId="nhan-vien"
        columns={columns}
        data={result?.data ?? []}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        emptyMessage="Chưa có nhân viên"
        manualPagination
        pagination={{ pageIndex: params.page - 1, pageSize: params.pageSize }}
        pageCount={
          result ? Math.ceil(result.total / result.pageSize) : undefined
        }
        toolbar={
          <DataTableToolbar
            searchValue={params.search}
            onSearchChange={setSearch}
            searchPlaceholder="Mã/tên nhân viên…"
            right={
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={() => navigate(ROUTES.hrEmployeeCreate)}
              >
                <Plus className="h-4 w-4" />
                Thêm nhân viên
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
    </div>
  )
}

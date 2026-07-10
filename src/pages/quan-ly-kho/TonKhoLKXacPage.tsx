/**
 * TonKhoLKXacPage — Xem Tồn Kho Linh Kiện Xác (W3). Same page-level
 * composition as XemTonKhoPage: KPI trio + Kỳ/cascade filter bar + a
 * page-level `DataTable` for the grid. Column set is the W2 20 columns MINUS
 * "Tổng tiền" (19 columns) — the KPI trio also hides its Tổng tiền box.
 * `Tổng tồn` can render negative here (a carcass-heavy period): no clamp.
 */
import { useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PackageCheck, Pencil, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  DataTable,
  DataTablePagination,
  PageHeader,
  KyPicker,
  KY_OPTIONS,
  notify,
} from '@/components/shared'
import { KpiTrio } from '@/components/finance/inventory-kpi-strip'
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { formatVND, formatNumber } from '@/lib/format'
import { fetchInventory } from '@/domains/warehouse/mock-data'
import { BRANCHES } from '@/mock/seed/branches'
import { NHA_KHO_ROWS } from '@/mock/masterdata'
import { MANUFACTURERS, MODELS } from '@/domains/repair/reference-data'
import type { InventoryRow } from '@/domains/warehouse/types'

const NHOM_HANG_OPTIONS = [
  'Điện lạnh',
  'Điện tử',
  'Điện Thoại',
  'Điện gia dụng',
  'linh kiện điện tử',
  'Dụng cụ sửa chửa',
  'Nguyên vật liêu sửa chửa',
  'Nhà vệ sinh',
]

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]
const UNSET = '__all__'

interface TonKhoLKXacFilters {
  branchId: string | null
  khoId: string | null
  nhomHang: string | null
  nhaSanXuat: string | null
  model: string | null
  maHang: string
  tuKy: string | null
  denKy: string | null
}

function defaultFilters(): TonKhoLKXacFilters {
  const latest = KY_OPTIONS[0]?.id ?? null
  return {
    branchId: null,
    khoId: null,
    nhomHang: null,
    nhaSanXuat: null,
    model: null,
    maHang: '',
    tuKy: latest,
    denKy: latest,
  }
}

export default function TonKhoLKXacPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TonKhoLKXacFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [updateRow, setUpdateRow] = useState<InventoryRow | null>(null)
  const [detailRow, setDetailRow] = useState<InventoryRow | null>(null)

  const commands = useMemo(
    () => [
      {
        id: 'nav-ton-kho-lk-xac',
        label: 'Mở Tồn Kho Linh Kiện Xác',
        group: 'Tài chính & Kho',
        icon: PackageCheck,
        keywords: ['ton kho lk xac', 'linh kien xac', 'carcass stock'],
        run: () => navigate(ROUTES.inventoryConfirmedStock),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-ton-kho-lk-xac', commands)

  const queryParams = useMemo(
    () => ({
      kind: 'ton-kho-lk-xac' as const,
      kyId: filters.denKy ?? undefined,
      branchId: filters.branchId ?? undefined,
      khoId: filters.khoId ?? undefined,
      nhomHang: filters.nhomHang ?? undefined,
      nhaSanXuat: filters.nhaSanXuat ?? undefined,
      model: filters.model ?? undefined,
      maHang: filters.maHang || undefined,
      page,
      pageSize,
    }),
    [filters, page, pageSize],
  )

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['inventory', queryParams],
    queryFn: () => fetchInventory(queryParams),
    placeholderData: keepPreviousData,
  })

  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const kpi = data?.kpi ?? { tonDauKy: 0, tongTien: 0, tongTon: 0 }

  function handleFilterChange(next: Partial<TonKhoLKXacFilters>) {
    setFilters((f) => ({ ...f, ...next }))
    setPage(1)
  }

  const columns = useMemo<ColumnDef<InventoryRow, unknown>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        enableSorting: false,
        size: 56,
        cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      },
      {
        id: 'actions',
        header: '##',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Cập nhật"
              onClick={() => setUpdateRow(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Xem chi tiết"
              onClick={() => setDetailRow(row.original)}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
      },
      {
        id: 'chiNhanh',
        header: 'Chi nhánh',
        cell: ({ row }) =>
          BRANCHES.find((b) => b.id === row.original.branchId)?.name ??
          row.original.branchId,
      },
      { id: 'maHang', header: 'Mã hàng', accessorKey: 'maHang' },
      { id: 'tenHang', header: 'Tên hàng', accessorKey: 'tenHang' },
      { id: 'nhomHang', header: 'Nhóm hàng', accessorKey: 'nhomHang' },
      { id: 'model', header: 'Model', accessorKey: 'model' },
      {
        id: 'giaVonDauKy',
        header: 'Giá vốn đầu kỳ',
        cell: ({ row }) => formatVND(row.original.giaVonDauKy),
      },
      {
        id: 'tonDauKy',
        header: 'Tồn đầu kỳ',
        cell: ({ row }) => formatNumber(row.original.tonDauKy),
      },
      {
        id: 'nhapTrongKy',
        header: 'Nhập trong kỳ',
        cell: ({ row }) => formatNumber(row.original.nhapTrongKy),
      },
      {
        id: 'xuatTrongKy',
        header: 'Xuất trong kỳ',
        cell: ({ row }) => formatNumber(row.original.xuatTrongKy),
      },
      {
        id: 'ton',
        header: 'Tồn',
        cell: ({ row }) => formatNumber(row.original.ton),
      },
      {
        id: 'giaVonTrongKy',
        header: 'Giá vốn trong kỳ',
        cell: ({ row }) => formatVND(row.original.giaVonTrongKy),
      },
      {
        id: 'tonCuoiKy',
        header: 'Tồn cuối kỳ',
        cell: ({ row }) => formatNumber(row.original.tonCuoiKy),
      },
      // NOTE: no "Tổng tiền" column here (19 cols, W2 minus Tổng tiền).
      { id: 'nhaSanXuat', header: 'Nhà sản xuất', accessorKey: 'nhaSanXuat' },
      { id: 'khoTen', header: 'Nhà kho', accessorKey: 'khoTen' },
      { id: 'nganChua', header: 'Ngăn chứa', accessorKey: 'nganChua' },
      { id: 'kyLabel', header: 'Kỳ', accessorKey: 'kyLabel' },
      {
        id: 'coSerial',
        header: 'Có serial',
        cell: ({ row }) => (row.original.coSerial ? 'Có' : 'Không'),
      },
    ],
    [page, pageSize],
  )

  return (
    <div className="space-y-0">
      <PageHeader
        title="Xem Tồn Kho Linh Kiện Xác"
        breadcrumbs={[
          { label: 'Quản Lý Kho', href: ROUTES.inventory },
          { label: 'Xem Tồn Kho Linh Kiện Xác' },
        ]}
      />
      <div className="space-y-4 px-4 pb-6 pt-4 md:px-6">
        <KpiTrio
          tonDauKy={kpi.tonDauKy}
          tongTien={kpi.tongTien}
          tongTon={kpi.tongTon}
          showTongTien={false}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label>Chi nhánh</Label>
            <Select
              value={filters.branchId ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ branchId: v === UNSET ? null : v })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Tất cả chi nhánh</SelectItem>
                {BRANCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Nhà kho</Label>
            <Select
              value={filters.khoId ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ khoId: v === UNSET ? null : v })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả nhà kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Tất cả nhà kho</SelectItem>
                {NHA_KHO_ROWS.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.tenNhaKho}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Nhóm hàng hóa</Label>
            <Select
              value={filters.nhomHang ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ nhomHang: v === UNSET ? null : v })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả nhóm hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Tất cả nhóm hàng</SelectItem>
                {NHOM_HANG_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Nhà sản xuất</Label>
            <Select
              value={filters.nhaSanXuat ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ nhaSanXuat: v === UNSET ? null : v })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả NSX" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Tất cả NSX</SelectItem>
                {MANUFACTURERS.map((m) => (
                  <SelectItem key={m.id} value={m.ten}>
                    {m.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Model</Label>
            <Select
              value={filters.model ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ model: v === UNSET ? null : v })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Tất cả model</SelectItem>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.ten}>
                    {m.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tklx-manhang">Mã/tên hàng hóa</Label>
            <Input
              id="tklx-manhang"
              className="h-9"
              placeholder="Nhập mã hoặc tên hàng…"
              value={filters.maHang}
              onChange={(e) => handleFilterChange({ maHang: e.target.value })}
            />
          </div>

          <KyPicker
            label="Từ Kỳ"
            value={filters.tuKy ?? undefined}
            onChange={(kyId) => handleFilterChange({ tuKy: kyId })}
          />
          <KyPicker
            label="Đến Kỳ"
            value={filters.denKy ?? undefined}
            onChange={(kyId) => handleFilterChange({ denKy: kyId })}
          />
        </div>

        <div className="min-w-[1200px]">
          <DataTable
            tableId="ton-kho-lk-xac"
            columns={columns}
            data={rows}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyMessage="Không có dữ liệu tồn kho linh kiện xác"
            getRowId={(r) => r.id}
            className={isFetching && !isLoading ? 'opacity-60' : undefined}
          />
        </div>

        {!isError && (
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
        )}
      </div>

      {updateRow && (
        <UpdateInventoryLocationDialog
          row={updateRow}
          onClose={() => setUpdateRow(null)}
        />
      )}
      {detailRow && (
        <InventoryDetailDialog
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </div>
  )
}

/** "Cập nhật" — edit warehouse location (nhà kho/ngăn chứa) for the row. Mock-only. */
function UpdateInventoryLocationDialog({
  row,
  onClose,
}: {
  row: InventoryRow
  onClose: () => void
}) {
  return (
    <SimpleDialog
      title="Cập nhật vị trí kho"
      onClose={onClose}
      onSave={() => {
        notify.success('Đã cập nhật vị trí kho')
        onClose()
      }}
    >
      <p className="text-sm">
        <span className="font-medium">{row.tenHang}</span> ({row.maHang})
      </p>
      <p className="text-sm text-muted-foreground">
        Nhà kho: {row.khoTen} · Ngăn chứa: {row.nganChua}
      </p>
    </SimpleDialog>
  )
}

/** "Xem chi tiết" — read-only row detail. */
function InventoryDetailDialog({
  row,
  onClose,
}: {
  row: InventoryRow
  onClose: () => void
}) {
  return (
    <SimpleDialog title="Chi tiết tồn kho linh kiện xác" onClose={onClose}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Mã hàng</dt>
        <dd>{row.maHang}</dd>
        <dt className="text-muted-foreground">Tên hàng</dt>
        <dd>{row.tenHang}</dd>
        <dt className="text-muted-foreground">Tồn đầu kỳ</dt>
        <dd>{formatNumber(row.tonDauKy)}</dd>
        <dt className="text-muted-foreground">Nhập trong kỳ</dt>
        <dd>{formatNumber(row.nhapTrongKy)}</dd>
        <dt className="text-muted-foreground">Xuất trong kỳ</dt>
        <dd>{formatNumber(row.xuatTrongKy)}</dd>
        <dt className="text-muted-foreground">Tồn cuối kỳ</dt>
        <dd>{formatNumber(row.tonCuoiKy)}</dd>
      </dl>
    </SimpleDialog>
  )
}

/** Minimal shared dialog shell for the row-action modals on this page. */
function SimpleDialog({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string
  onClose: () => void
  onSave?: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">{children}</div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          {onSave && <Button onClick={onSave}>Lưu</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

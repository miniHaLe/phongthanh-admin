/**
 * TonKhoLKXacPage — Xem Tồn Kho Linh Kiện Xác (W3). Same page-level
 * composition as XemTonKhoPage: KPI trio + Kỳ/cascade filter bar + a
 * page-level `DataTable` for the grid. Column set is the W2 20 columns MINUS
 * "Tổng tiền" (19 columns) — the KPI trio also hides its Tổng tiền box.
 * `Tổng tồn` can render negative here (a carcass-heavy period): no clamp.
 */
import { useId, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { PackageCheck } from 'lucide-react'
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
import { exportToXlsx, type ExportColumn } from '@/lib/export-xlsx'
import { formatNumber } from '@/lib/format'
import { fetchInventory } from '@/domains/warehouse/mock-data'
import { BRANCHES } from '@/mock/seed/branches'
import { useLookup } from '@/hooks/use-lookup'
import { MANUFACTURERS, MODELS } from '@/domains/repair/reference-data'
import type { InventoryRow } from '@/domains/warehouse/types'
import { useInventoryCompositeColumns } from '@/features/warehouse/inventory-composite-table-columns'

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

import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const UNSET = '__all__'

const EXPORT_COLUMNS: ExportColumn<InventoryRow>[] = [
  {
    header: 'Chi nhánh',
    accessor: (row) =>
      BRANCHES.find((branch) => branch.id === row.branchId)?.name ??
      row.branchId,
  },
  { header: 'Mã hàng', accessor: (row) => row.maHang },
  { header: 'Tên hàng', accessor: (row) => row.tenHang },
  { header: 'Nhóm hàng', accessor: (row) => row.nhomHang },
  { header: 'Model', accessor: (row) => row.model },
  { header: 'Giá vốn đầu kỳ', accessor: (row) => row.giaVonDauKy },
  { header: 'Tồn đầu kỳ', accessor: (row) => row.tonDauKy },
  { header: 'Nhập trong kỳ', accessor: (row) => row.nhapTrongKy },
  { header: 'Xuất trong kỳ', accessor: (row) => row.xuatTrongKy },
  { header: 'Tồn', accessor: (row) => row.ton },
  { header: 'Giá vốn trong kỳ', accessor: (row) => row.giaVonTrongKy },
  { header: 'Tồn cuối kỳ', accessor: (row) => row.tonCuoiKy },
  { header: 'Nhà sản xuất', accessor: (row) => row.nhaSanXuat },
  { header: 'Nhà kho', accessor: (row) => row.khoTen },
  { header: 'Ngăn chứa', accessor: (row) => row.nganChua },
  { header: 'Kỳ', accessor: (row) => row.kyLabel },
  { header: 'Có serial', accessor: (row) => (row.coSerial ? 'Có' : 'Không') },
]

interface TonKhoLKXacFilters {
  branchId: string | null
  khoId: string | null
  nganChuaId: string | null
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
    nganChuaId: null,
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
  const { rows: nhaKhoRows } = useLookup('nha-kho')
  const { rows: nganChuaRows } = useLookup('ngan-chua')
  const filterId = useId()
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
      nganChuaId: filters.nganChuaId ?? undefined,
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

  function handleWarehouseChange(khoId: string | null) {
    const keepsCabinet = nganChuaRows.some(
      (row) => row.id === filters.nganChuaId && row.nhaKhoId === khoId,
    )
    handleFilterChange({
      khoId,
      nganChuaId: keepsCabinet ? filters.nganChuaId : null,
    })
  }

  const filteredCabinets = filters.khoId
    ? nganChuaRows.filter((row) => row.nhaKhoId === filters.khoId)
    : []

  async function handleExport() {
    const result = await fetchInventory({
      ...queryParams,
      page: 1,
      pageSize: Math.max(total, 300),
    })
    await exportToXlsx({
      filename: 'ton-kho-linh-kien-xac',
      sheetName: 'Tồn kho LK xác',
      columns: EXPORT_COLUMNS,
      rows: result.rows,
    })
  }

  const columns = useInventoryCompositeColumns({
    page,
    pageSize,
    showTotal: false,
    onEdit: setUpdateRow,
    onDetail: setDetailRow,
  })

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
            <Label htmlFor={`${filterId}-warehouse`}>Nhà kho</Label>
            <Select
              value={filters.khoId ?? UNSET}
              onValueChange={(v) =>
                handleWarehouseChange(v === UNSET ? null : v)
              }
            >
              <SelectTrigger id={`${filterId}-warehouse`} className="h-9">
                <SelectValue placeholder="Tất cả nhà kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Tất cả nhà kho</SelectItem>
                {nhaKhoRows.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.tenNhaKho}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${filterId}-cabinet`}>Ngăn chứa</Label>
            <Select
              value={filters.nganChuaId ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({
                  nganChuaId: v === UNSET ? null : v,
                })
              }
              disabled={!filters.khoId}
            >
              <SelectTrigger id={`${filterId}-cabinet`} className="h-9">
                <SelectValue placeholder="Tất cả ngăn chứa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>Tất cả ngăn chứa</SelectItem>
                {filteredCabinets.map((cabinet) => (
                  <SelectItem key={cabinet.id} value={cabinet.id}>
                    {cabinet.tenNgan}
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

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={() => void refetch()}
          >
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExport()}
          >
            Xuất ra Excel
          </Button>
        </div>

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
          scrollLabel="Bảng tồn kho linh kiện xác"
          tableMinWidth={1560}
          tableLayout="content-safe"
        />

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

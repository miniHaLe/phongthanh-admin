/**
 * XemTonKhoPage — Xem Tồn Kho (W2). Page-level composition: KPI trio + Kỳ/
 * cascade filter bar rendered by the page, grid via a page-level `DataTable`
 * (verified 20-column reference set — CrudConfig/CrudTablePage can't express
 * the Từ Kỳ/Đến Kỳ picker + KPI slot this view needs). Read-only view: no
 * create/delete, only per-row Cập nhật / Xem chi tiết + Kỳ-range filtering.
 */
import { useId, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Boxes } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  DataTable,
  DataTablePagination,
  FilterPanel,
  PageHeader,
  KY_OPTIONS,
  notify,
} from '@/components/shared'
import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
import { filterControlClassName } from '@/components/shared/filter-panel/filter-control-classes'
import { FilterField } from '@/components/shared/filter-panel/filter-field'
import { KpiTrio } from '@/components/finance/inventory-kpi-strip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const UNSET = '__all__'

interface XemTonKhoFilters {
  branchId: string | null
  khoId: string | null
  nhomHang: string | null
  nhaSanXuat: string | null
  model: string | null
  maHang: string
  tuKy: string | null
  denKy: string | null
}

function defaultFilters(): XemTonKhoFilters {
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

const DEFAULT_FILTERS = defaultFilters()

function countChangedFilters(filters: XemTonKhoFilters): number {
  return (Object.keys(DEFAULT_FILTERS) as (keyof XemTonKhoFilters)[]).filter(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  ).length
}

export default function XemTonKhoPage() {
  const navigate = useNavigate()
  const filterId = useId()
  const [filters, setFilters] = useState<XemTonKhoFilters>(() => ({
    ...DEFAULT_FILTERS,
  }))
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [updateRow, setUpdateRow] = useState<InventoryRow | null>(null)
  const [detailRow, setDetailRow] = useState<InventoryRow | null>(null)

  const commands = useMemo(
    () => [
      {
        id: 'nav-xem-ton-kho',
        label: 'Mở Xem Tồn Kho',
        group: 'Tài chính & Kho',
        icon: Boxes,
        keywords: ['ton kho', 'xem ton', 'inventory', 'kho'],
        run: () => navigate(ROUTES.inventoryStockView),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-xem-ton-kho', commands)

  const queryParams = useMemo(
    () => ({
      kind: 'ton-kho' as const,
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

  function handleFilterChange(next: Partial<XemTonKhoFilters>) {
    setFilters((f) => ({ ...f, ...next }))
    setPage(1)
  }

  function clearFilters() {
    setFilters({ ...DEFAULT_FILTERS })
    setPage(1)
  }

  const columns = useInventoryCompositeColumns({
    page,
    pageSize,
    onEdit: setUpdateRow,
    onDetail: setDetailRow,
  })

  return (
    <div className="space-y-0">
      <PageHeader
        title="Xem Tồn Kho"
        breadcrumbs={[
          { label: 'Quản Lý Kho', href: ROUTES.inventory },
          { label: 'Xem Tồn Kho' },
        ]}
      />
      <div className="space-y-4 px-4 pb-6 pt-4 md:px-6">
        <KpiTrio
          tonDauKy={kpi.tonDauKy}
          tongTien={kpi.tongTien}
          tongTon={kpi.tongTon}
          isLoading={isLoading}
        />

        <FilterPanel
          defaultExpanded
          filterCount={countChangedFilters(filters)}
          onClear={clearFilters}
          contentClassName="lg:grid-cols-4"
        >
          <FilterField label="Chi nhánh" htmlFor={`${filterId}-branch`}>
            <Select
              value={filters.branchId ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ branchId: v === UNSET ? null : v })
              }
            >
              <SelectTrigger
                id={`${filterId}-branch`}
                className={filterControlClassName}
              >
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
          </FilterField>

          <FilterField label="Nhà kho" htmlFor={`${filterId}-warehouse`}>
            <Select
              value={filters.khoId ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ khoId: v === UNSET ? null : v })
              }
            >
              <SelectTrigger
                id={`${filterId}-warehouse`}
                className={filterControlClassName}
              >
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
          </FilterField>

          <FilterField label="Nhóm hàng hóa" htmlFor={`${filterId}-group`}>
            <Select
              value={filters.nhomHang ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ nhomHang: v === UNSET ? null : v })
              }
            >
              <SelectTrigger
                id={`${filterId}-group`}
                className={filterControlClassName}
              >
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
          </FilterField>

          <FilterField
            label="Nhà sản xuất"
            htmlFor={`${filterId}-manufacturer`}
          >
            <Select
              value={filters.nhaSanXuat ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ nhaSanXuat: v === UNSET ? null : v })
              }
            >
              <SelectTrigger
                id={`${filterId}-manufacturer`}
                className={filterControlClassName}
              >
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
          </FilterField>

          <FilterField label="Model" htmlFor={`${filterId}-model`}>
            <Select
              value={filters.model ?? UNSET}
              onValueChange={(v) =>
                handleFilterChange({ model: v === UNSET ? null : v })
              }
            >
              <SelectTrigger
                id={`${filterId}-model`}
                className={filterControlClassName}
              >
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
          </FilterField>

          <FilterField label="Mã/tên hàng hóa" htmlFor={`${filterId}-product`}>
            <Input
              id={`${filterId}-product`}
              className={filterControlClassName}
              placeholder="Nhập mã hoặc tên hàng…"
              value={filters.maHang}
              onChange={(e) => handleFilterChange({ maHang: e.target.value })}
            />
          </FilterField>

          <FilterField label="Từ Kỳ" htmlFor={`${filterId}-from-period`}>
            <Select
              value={filters.tuKy ?? undefined}
              onValueChange={(kyId) => handleFilterChange({ tuKy: kyId })}
            >
              <SelectTrigger
                id={`${filterId}-from-period`}
                className={filterControlClassName}
              >
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                {KY_OPTIONS.map((ky) => (
                  <SelectItem key={ky.id} value={ky.id}>
                    {ky.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Đến Kỳ" htmlFor={`${filterId}-to-period`}>
            <Select
              value={filters.denKy ?? undefined}
              onValueChange={(kyId) => handleFilterChange({ denKy: kyId })}
            >
              <SelectTrigger
                id={`${filterId}-to-period`}
                className={filterControlClassName}
              >
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                {KY_OPTIONS.map((ky) => (
                  <SelectItem key={ky.id} value={ky.id}>
                    {ky.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </FilterPanel>

        <DataTable
          tableId="xem-ton-kho"
          columns={columns}
          data={rows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có dữ liệu tồn kho"
          getRowId={(r) => r.id}
          className={isFetching && !isLoading ? 'opacity-60' : undefined}
          scrollLabel="Bảng xem tồn kho"
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
    <SimpleDialog title="Chi tiết tồn kho" onClose={onClose}>
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
        <dt className="text-muted-foreground">Tổng tiền</dt>
        <dd>{formatVND(row.tongTien)}</dd>
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

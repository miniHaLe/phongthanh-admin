/**
 * TonKhoKyThuatPage — Xem Tồn Kho Kỹ Thuật (W4). Page-level composition like
 * the other two inventory views, but the defining dimension is the technician
 * axis (Kỹ thuật): 16-column grid (drops Kho/Ngăn chứa/Tổng tiền/Có serial —
 * the technician holds parts, not a warehouse slot), an added "Nhập tên kỹ
 * thuật" filter, and a "Trả linh kiện kho kỹ thuật" row action instead of
 * Cập nhật/Xem chi tiết.
 */
import { useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Cpu, Undo2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  DataTable,
  DataTablePagination,
  PageHeader,
  KyPicker,
  KY_OPTIONS,
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
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { exportToXlsx, type ExportColumn } from '@/lib/export-xlsx'
import { formatVND, formatNumber } from '@/lib/format'
import { fetchInventory } from '@/domains/warehouse/mock-data'
import { BRANCHES } from '@/mock/seed/branches'
import { MANUFACTURERS, MODELS } from '@/domains/repair/reference-data'
import { TraLinhKienTechModal } from '@/features/inventory/tra-linh-kien-tech-modal'
import type { InventoryRow } from '@/domains/warehouse/types'
import { getVisibleRowNumber } from '@/components/shared/data-table/visible-row-number'

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
  { header: 'Kỳ', accessor: (row) => row.kyLabel },
  { header: 'Kỹ thuật', accessor: (row) => row.kyThuat },
  { header: 'Mã hàng', accessor: (row) => row.maHang },
  { header: 'Tên hàng', accessor: (row) => row.tenHang },
  { header: 'Nhóm hàng', accessor: (row) => row.nhomHang },
  { header: 'Nhà sản xuất', accessor: (row) => row.nhaSanXuat },
  { header: 'Model', accessor: (row) => row.model },
  { header: 'Tồn đầu kỳ', accessor: (row) => row.tonDauKy },
  { header: 'Nhập trong kỳ', accessor: (row) => row.nhapTrongKy },
  { header: 'Xuất trong kỳ', accessor: (row) => row.xuatTrongKy },
  { header: 'Tồn', accessor: (row) => row.ton },
  { header: 'Giá vốn trong kỳ', accessor: (row) => row.giaVonTrongKy },
  { header: 'Tồn cuối kỳ', accessor: (row) => row.tonCuoiKy },
]

interface TonKhoKyThuatFilters {
  branchId: string | null
  nhomHang: string | null
  nhaSanXuat: string | null
  model: string | null
  kyThuat: string
  tuKy: string | null
  denKy: string | null
}

function defaultFilters(): TonKhoKyThuatFilters {
  const latest = KY_OPTIONS[0]?.id ?? null
  return {
    branchId: null,
    nhomHang: null,
    nhaSanXuat: null,
    model: null,
    kyThuat: '',
    tuKy: latest,
    denKy: latest,
  }
}

export default function TonKhoKyThuatPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TonKhoKyThuatFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [returnRow, setReturnRow] = useState<InventoryRow | null>(null)

  const commands = useMemo(
    () => [
      {
        id: 'nav-ton-kho-ky-thuat',
        label: 'Mở Tồn Kho Kỹ Thuật',
        group: 'Tài chính & Kho',
        icon: Cpu,
        keywords: ['ton kho ky thuat', 'technician stock', 'kho ky thuat'],
        run: () => navigate(ROUTES.inventoryTechStock),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-ton-kho-ky-thuat', commands)

  const queryParams = useMemo(
    () => ({
      kind: 'ton-kho-ky-thuat' as const,
      kyId: filters.denKy ?? undefined,
      branchId: filters.branchId ?? undefined,
      nhomHang: filters.nhomHang ?? undefined,
      nhaSanXuat: filters.nhaSanXuat ?? undefined,
      model: filters.model ?? undefined,
      kyThuat: filters.kyThuat || undefined,
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

  function handleFilterChange(next: Partial<TonKhoKyThuatFilters>) {
    setFilters((f) => ({ ...f, ...next }))
    setPage(1)
  }

  async function handleExport() {
    const result = await fetchInventory({
      ...queryParams,
      page: 1,
      pageSize: Math.max(total, 300),
    })
    await exportToXlsx({
      filename: 'ton-kho-ky-thuat',
      sheetName: 'Tồn kho kỹ thuật',
      columns: EXPORT_COLUMNS,
      rows: result.rows,
    })
  }

  const columns = useMemo<ColumnDef<InventoryRow, unknown>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        enableSorting: false,
        size: 56,
        cell: ({ row, table }) =>
          getVisibleRowNumber(table, row, (page - 1) * pageSize),
      },
      {
        id: 'actions',
        header: '##',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Trả linh kiện kho kỹ thuật"
            onClick={() => setReturnRow(row.original)}
          >
            <Undo2 className="size-4" />
          </Button>
        ),
      },
      {
        id: 'chiNhanh',
        header: 'Chi nhánh',
        cell: ({ row }) =>
          BRANCHES.find((b) => b.id === row.original.branchId)?.name ??
          row.original.branchId,
      },
      { id: 'kyLabel', header: 'Kỳ', accessorKey: 'kyLabel' },
      { id: 'kyThuat', header: 'Kỹ thuật', accessorKey: 'kyThuat' },
      { id: 'maHang', header: 'Mã hàng', accessorKey: 'maHang' },
      { id: 'tenHang', header: 'Tên hàng', accessorKey: 'tenHang' },
      { id: 'nhomHang', header: 'Nhóm hàng', accessorKey: 'nhomHang' },
      { id: 'nhaSanXuat', header: 'Nhà sản xuất', accessorKey: 'nhaSanXuat' },
      { id: 'model', header: 'Model', accessorKey: 'model' },
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
    ],
    [page, pageSize],
  )

  return (
    <div className="space-y-0">
      <PageHeader
        title="Tồn Kho Kỹ Thuật"
        breadcrumbs={[
          { label: 'Quản Lý Kho', href: ROUTES.inventory },
          { label: 'Tồn Kho Kỹ Thuật' },
        ]}
      />
      <div className="space-y-4 px-4 pb-6 pt-4 md:px-6">
        <KpiTrio
          tonDauKy={kpi.tonDauKy}
          tongTien={kpi.tongTien}
          tongTon={kpi.tongTon}
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
            <Label htmlFor="tkt-kythuat">Nhập tên kỹ thuật</Label>
            <Input
              id="tkt-kythuat"
              className="h-9"
              placeholder="Nhập tên kỹ thuật…"
              value={filters.kyThuat}
              onChange={(e) => handleFilterChange({ kyThuat: e.target.value })}
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
          tableId="ton-kho-ky-thuat"
          columns={columns}
          data={rows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có dữ liệu tồn kho kỹ thuật"
          getRowId={(r) => r.id}
          className={isFetching && !isLoading ? 'opacity-60' : undefined}
          scrollLabel="Bảng tồn kho kỹ thuật"
          tableClassName="min-w-[1200px]"
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

      {returnRow && (
        <TraLinhKienTechModal
          open={!!returnRow}
          onOpenChange={(open) => !open && setReturnRow(null)}
          row={returnRow}
        />
      )}
    </div>
  )
}

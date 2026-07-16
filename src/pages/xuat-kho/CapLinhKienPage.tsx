/**
 * CapLinhKienPage — Cấp Linh Kiện list. Verified 7-column reference set (no
 * checkbox, no per-row edit), Tổng tiền info-box (yellow), Chi tiết + print
 * per row, Thêm phiếu cấp → full-page create editor.
 */
import { useMemo, useState } from 'react'
import { Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { PaginationState } from '@tanstack/react-table'
import {
  DataTable,
  DataTablePagination,
  PageHeader,
  FilterPanel,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { fetchCheckoutList } from '@/domains/warehouse/list-fetchers'
import { formatVND } from '@/lib/format'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import type { CheckOutSlip } from '@/domains/warehouse/types'
import {
  CAP_LINH_KIEN_TABLE_ID,
  useCapLinhKienColumns,
} from '@/features/stockout/cap-linh-kien-table-columns'
import {
  CapLinhKienFilters,
  type CapLinhKienFilterValues,
} from '@/features/stockout/cap-linh-kien-filters'
import {
  buildCheckoutDetailRows,
  type CheckoutDetailRow,
} from '@/features/stockout/checkout-detail-report'
import {
  VoucherLineDetailDialog,
  type VoucherLineDetailColumn,
} from '@/features/warehouse/voucher-line-detail-dialog'

import { STANDARD_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const DEFAULT_PAGE_SIZE = 20

const EXPORT_COLUMNS = [
  { header: 'Số phiếu cấp', accessor: (r: CheckOutSlip) => r.soPhieuCap },
  { header: 'Ngày lập', accessor: (r: CheckOutSlip) => r.ngayLap },
  { header: 'Kỹ thuật', accessor: (r: CheckOutSlip) => r.kyThuat },
  { header: 'Số tiền', accessor: (r: CheckOutSlip) => r.soTien },
  { header: 'Người lập', accessor: (r: CheckOutSlip) => r.nguoiLap },
  { header: 'Ghi chú', accessor: (r: CheckOutSlip) => r.ghiChu },
]

const DETAIL_COLUMNS: VoucherLineDetailColumn<CheckoutDetailRow>[] = [
  { header: 'Số phiếu cấp', cell: (row) => row.soPhieuCap },
  { header: 'Ngày lập', cell: (row) => row.ngayLap.slice(0, 10) },
  { header: 'Kỹ thuật', cell: (row) => row.kyThuat },
  { header: 'Số phiếu SC', cell: (row) => row.soPhieuSC },
  { header: 'Mã hàng', cell: (row) => row.maHang },
  { header: 'Tên hàng', cell: (row) => row.tenHang },
  { header: 'Nhà sản xuất', cell: (row) => row.nhaSanXuat },
  { header: 'Model', cell: (row) => row.model || '—' },
  { header: 'Nhà kho', cell: (row) => row.khoTen },
  { header: 'Ngăn chứa', cell: (row) => row.nganChua },
  { header: 'Mục đích', cell: (row) => row.mucDich },
  { header: 'Số lượng', cell: (row) => row.soLuong },
  { header: 'Giá', cell: (row) => formatVND(row.gia) },
  { header: 'Thành tiền', cell: (row) => formatVND(row.thanhTien) },
]

export default function CapLinhKienPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<CapLinhKienFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [detailOpen, setDetailOpen] = useState(false)

  const commands = useMemo(
    () => [
      {
        id: 'nav-cap-linh-kien',
        label: 'Mở Cấp Linh Kiện',
        group: 'Tài chính & Kho',
        icon: Wrench,
        keywords: ['cap linh kien', 'xuat kho', 'linh kien'],
        run: () => navigate(ROUTES.stockOutPartsDispatch),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-cap-linh-kien', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'cap-linh-kien-list',
      filters,
    ],
    queryFn: () =>
      fetchCheckoutList({
        branchId: filters.branchId,
        soPhieu: filters.soPhieuCap,
        kyThuat: filters.kyThuat,
        khoId: filters.khoId,
        mucDich: filters.mucDich,
        soPhieuSC: filters.soPhieuSC,
        maSanPham: filters.maSanPham,
        nsx: filters.nsx,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        pageSize: 300,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useCapLinhKienColumns()

  const filteredRows = useMemo(() => data?.data ?? [], [data?.data])
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }
  const tongTien = filteredRows.reduce((s, r) => s + r.soTien, 0)
  const detailRows = useMemo(
    () => buildCheckoutDetailRows(filteredRows, filters),
    [filteredRows, filters],
  )

  function handleFilterChange(next: Partial<CapLinhKienFilterValues>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter(
    (v) => v != null && v !== '',
  ).length

  async function handleExport() {
    await exportListXlsx({
      filename: 'cap-linh-kien',
      sheetName: 'Cấp Linh Kiện',
      columns: EXPORT_COLUMNS,
      rows: filteredRows,
    })
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="Cấp Linh Kiện"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Cấp Linh Kiện' },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          defaultExpanded
        >
          <CapLinhKienFilters filters={filters} onChange={handleFilterChange} />
        </FilterPanel>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => navigate(ROUTES.stockOutPartsDispatchCreate)}
          >
            Thêm phiếu cấp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => refetch()}
          >
            Tìm kiếm
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => setDetailOpen(true)}
          >
            Tìm chi tiết
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => void handleExport()}
          >
            Xuất Excel
          </Button>

          <div className="flex-1" />

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            Tổng tiền: {formatVND(tongTien)}
          </div>
        </div>

        <DataTable
          tableId={CAP_LINH_KIEN_TABLE_ID}
          columns={columns}
          data={pageRows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có phiếu cấp linh kiện nào"
          manualPagination
          pagination={pagination}
          pageCount={totalPages}
          getRowId={(r) => r.id}
          scrollLabel="Bảng cấp linh kiện"
          tableClassName="min-w-[1100px]"
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

      <VoucherLineDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Chi tiết cấp linh kiện"
        rows={detailRows}
        columns={DETAIL_COLUMNS}
        getRowId={(row) => row.id}
        emptyMessage="Không có dòng cấp linh kiện phù hợp"
      />
    </div>
  )
}

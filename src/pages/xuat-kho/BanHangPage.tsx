/**
 * BanHangPage — Bán Hàng list. Verified 8-column reference set (checkbox +
 * 7 data columns + Chọn, no Trạng thái). Per-row Thêm hình/Chỉnh sửa/Xuất
 * kho/Chi tiết, bulk toolbar, Tìm kiếm/Tìm chi tiết/Xuất Excel/Báo cáo lợi nhuận.
 */
import { useMemo, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { isWithinInterval, parseISO } from 'date-fns'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import {
  DataTable,
  DataTablePagination,
  PageHeader,
  BulkActionsBar,
  FilterPanel,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { fetchSellingList } from '@/domains/warehouse/list-fetchers'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import type { SellingOrder } from '@/domains/warehouse/types'
import {
  BAN_HANG_TABLE_ID,
  useBanHangColumns,
} from '@/features/stockout/ban-hang-table-columns'
import {
  BanHangFilters,
  type BanHangFilterValues,
} from '@/features/stockout/ban-hang-filters'
import { BanHangBatchToolbar } from '@/features/stockout/ban-hang-batch-toolbar'
import { deleteSellingOrders } from '@/features/stockout/delete-selling'

import { COMPACT_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const DEFAULT_PAGE_SIZE = 20

const EXPORT_COLUMNS = [
  { header: 'Số phiếu', accessor: (r: SellingOrder) => r.soPhieu },
  { header: 'Ngày lập', accessor: (r: SellingOrder) => r.ngayLap },
  { header: 'Khách hàng', accessor: (r: SellingOrder) => r.khachHang },
  { header: 'Điện thoại', accessor: (r: SellingOrder) => r.dienThoai },
  { header: 'Tổng tiền', accessor: (r: SellingOrder) => r.tongTien },
  { header: 'Người lập', accessor: (r: SellingOrder) => r.nguoiLap },
  { header: 'Ghi chú', accessor: (r: SellingOrder) => r.ghiChu },
]

function applyClientFilters(
  rows: SellingOrder[],
  f: BanHangFilterValues,
): SellingOrder[] {
  let out = rows
  if (f.tenKhachHang) {
    const q = f.tenKhachHang.toLowerCase()
    out = out.filter((r) => r.khachHang.toLowerCase().includes(q))
  }
  if (f.dateFrom || f.dateTo) {
    const from = f.dateFrom ? parseISO(f.dateFrom) : new Date(0)
    const to = f.dateTo ? parseISO(f.dateTo) : new Date(8640000000000000)
    out = out.filter((r) => {
      try {
        return isWithinInterval(parseISO(r.ngayLap), { start: from, end: to })
      } catch {
        return false
      }
    })
  }
  return out
}

export default function BanHangPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<BanHangFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const commands = useMemo(
    () => [
      {
        id: 'nav-ban-hang',
        label: 'Mở Bán Hàng',
        group: 'Tài chính & Kho',
        icon: ShoppingCart,
        keywords: ['ban hang', 'xuat kho', 'sales'],
        run: () => navigate(ROUTES.stockOutSales),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-ban-hang', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'ban-hang-list',
      { branchId: filters.branchId, soPhieu: filters.soPhieu },
    ],
    queryFn: () =>
      fetchSellingList({
        branchId: filters.branchId,
        soPhieu: filters.soPhieu,
        pageSize: 300,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = useBanHangColumns()

  const filteredRows = useMemo(
    () => applyClientFilters(data?.data ?? [], filters),
    [data?.data, filters],
  )
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }
  const selectedRows = filteredRows.filter((r) => rowSelection[r.id])

  function handleFilterChange(next: Partial<BanHangFilterValues>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter(
    (v) => v != null && v !== '',
  ).length

  async function handleExport() {
    await exportListXlsx({
      filename: 'ban-hang',
      sheetName: 'Bán Hàng',
      columns: EXPORT_COLUMNS,
      rows: filteredRows,
    })
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="Bán Hàng"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Bán Hàng' },
        ]}
      >
        <Button
          size="sm"
          className="h-8"
          onClick={() => navigate(ROUTES.stockOutSalesCreate)}
        >
          Thêm phiếu bán hàng
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          defaultExpanded
        >
          <BanHangFilters filters={filters} onChange={handleFilterChange} />
        </FilterPanel>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => refetch()}
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
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => void handleExport()}
          >
            Báo cáo lợi nhuận
          </Button>
        </div>

        <BanHangBatchToolbar
          selected={selectedRows}
          onReload={() => refetch()}
          onDelete={(ids) => {
            deleteSellingOrders(ids)
            refetch()
          }}
        />

        <BulkActionsBar count={selectedRows.length} />

        <DataTable
          tableId={BAN_HANG_TABLE_ID}
          columns={columns}
          data={pageRows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có phiếu bán hàng nào"
          manualPagination
          pagination={pagination}
          pageCount={totalPages}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(r) => r.id}
          scrollLabel="Bảng bán hàng"
          tableClassName="min-w-[1300px]"
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
    </div>
  )
}

/**
 * NhapKhoPage — goods receipt / stock entry list. Verified reference columns
 * (no Trạng thái — receiving vouchers carry no approval state machine), Tổng
 * tiền info-box, Thêm mới → full-page create editor, Xuất Excel.
 */
import { useMemo, useState } from 'react'
import { PackagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { DataTable, DataTablePagination, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { fetchReceivingList } from '@/domains/warehouse/list-fetchers'
import { formatVND } from '@/lib/format'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import type { ReceivingVoucher } from '@/domains/warehouse/types'
import {
  NHAP_KHO_TABLE_ID,
  useNhapKhoColumns,
} from '@/features/warehouse/nhap-kho-table-columns'

import { COMPACT_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const DEFAULT_PAGE_SIZE = 20

const EXPORT_COLUMNS = [
  { header: 'Số phiếu', accessor: (r: ReceivingVoucher) => r.soPhieu },
  { header: 'Số đặt hàng', accessor: (r: ReceivingVoucher) => r.soDatHang },
  { header: 'Số hóa đơn', accessor: (r: ReceivingVoucher) => r.soHoaDon },
  { header: 'Nhà cung cấp', accessor: (r: ReceivingVoucher) => r.nhaCungCap },
  {
    header: 'Hình thức thanh toán',
    accessor: (r: ReceivingVoucher) => r.hinhThucThanhToan,
  },
  { header: 'Nhà kho', accessor: (r: ReceivingVoucher) => r.khoTen },
  { header: 'Số tiền', accessor: (r: ReceivingVoucher) => r.soTien },
  { header: 'Người lập', accessor: (r: ReceivingVoucher) => r.nguoiLap },
  { header: 'Ngày lập', accessor: (r: ReceivingVoucher) => r.ngayLap },
  { header: 'Ghi Chú', accessor: (r: ReceivingVoucher) => r.ghiChu },
]

export default function NhapKhoPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const commands = useMemo(
    () => [
      {
        id: 'nav-nhap-kho',
        label: 'Mở Nhập Kho',
        group: 'Tài chính & Kho',
        icon: PackagePlus,
        keywords: ['nhap kho', 'hang hoa', 'kho'],
        run: () => navigate(ROUTES.inventoryStockEntry),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-nhap-kho', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['receiving-list', { page, pageSize }],
    queryFn: () => fetchReceivingList({ page, pageSize }),
    placeholderData: keepPreviousData,
  })

  const columns = useNhapKhoColumns()

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const tongTien = rows.reduce((s, r) => s + r.soTien, 0)
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  async function handleExport() {
    const res = await fetchReceivingList({ page: 1, pageSize: total || 1 })
    await exportListXlsx({
      filename: 'nhap-kho',
      sheetName: 'Nhập Kho',
      columns: EXPORT_COLUMNS,
      rows: res.data,
    })
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title="Nhập Kho"
        breadcrumbs={[
          { label: 'Quản Lý Kho', href: ROUTES.inventory },
          { label: 'Nhập Kho' },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => navigate(ROUTES.inventoryStockEntryCreate)}
          >
            <PackagePlus className="size-4" />
            Thêm mới
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => refetch()}
          >
            Tải lại trang
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

          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            Tổng tiền: {formatVND(tongTien)}
          </div>
        </div>

        <DataTable
          tableId={NHAP_KHO_TABLE_ID}
          columns={columns}
          data={rows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có phiếu nhập kho nào"
          manualPagination
          pagination={pagination}
          pageCount={totalPages}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(r) => r.id}
          scrollLabel="Bảng nhập kho"
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
    </div>
  )
}

/**
 * DsTraLKXacPage — Danh sách trả linh kiện xác (NEW page, W7). 20 verified
 * columns, bulk Trả hàng (Chưa trả hãng → Đã trả hãng via traHang), In BB Kỹ
 * Thuật + In Phiếu Trả Hãng prints, Xuất ra Excel. Route: /quan-ly-kho/ds-tra-lk-xac
 */
import { useMemo, useState } from 'react'
import { PackageX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { isWithinInterval, parseISO } from 'date-fns'
import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import { DataTable, DataTablePagination, PageHeader, BulkActionsBar, FilterPanel } from '@/components/shared'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { fetchPartReturnXacList } from '@/domains/warehouse/list-fetchers'
import type { PartReturnXac } from '@/domains/warehouse/types'
import { KpiBox } from '@/features/warehouse/kpi-box'
import {
  PART_RETURN_XAC_TABLE_ID,
  usePartReturnXacColumns,
} from '@/features/warehouse/part-return-xac-table-columns'
import { PartReturnXacBatchToolbar } from '@/features/warehouse/part-return-xac-batch-toolbar'
import {
  PartReturnXacFilters,
  type PartReturnXacFilterValues,
} from '@/features/warehouse/part-return-xac-filters'

import { COMPACT_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from '@/components/shared/data-table/page-size-options'
const DEFAULT_PAGE_SIZE = 20

function applyClientFilters(rows: PartReturnXac[], f: PartReturnXacFilterValues): PartReturnXac[] {
  let out = rows
  if (f.khoId) out = out.filter((r) => r.nhaKho === f.khoId)
  if (f.kyThuat) out = out.filter((r) => r.kyThuat === f.kyThuat)
  if (f.soPhieuCap) {
    const q = f.soPhieuCap.toLowerCase()
    out = out.filter((r) => r.soPhieuCap.toLowerCase().includes(q))
  }
  if (f.soPhieuSC) {
    const q = f.soPhieuSC.toLowerCase()
    out = out.filter((r) => r.soPhieuSC.toLowerCase().includes(q))
  }
  if (f.soPhieuHang) {
    const q = f.soPhieuHang.toLowerCase()
    out = out.filter((r) => r.soPhieuHang.toLowerCase().includes(q))
  }
  if (f.maSanPham) {
    const q = f.maSanPham.toLowerCase()
    out = out.filter(
      (r) => r.maHang.toLowerCase().includes(q) || r.tenHang.toLowerCase().includes(q),
    )
  }
  if (f.nsx) out = out.filter((r) => r.nsx === f.nsx)
  if (f.dateFrom || f.dateTo) {
    const from = f.dateFrom ? parseISO(f.dateFrom) : new Date(0)
    const to = f.dateTo ? parseISO(f.dateTo) : new Date(8640000000000000)
    out = out.filter((r) => {
      try {
        return isWithinInterval(parseISO(r.ngayTao), { start: from, end: to })
      } catch {
        return false
      }
    })
  }
  return out
}

export default function DsTraLKXacPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PartReturnXacFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const commands = useMemo(
    () => [
      {
        id: 'nav-ds-tra-lk-xac',
        label: 'Mở Danh Sách Trả Linh Kiện Xác',
        group: 'Tài chính & Kho',
        icon: PackageX,
        keywords: ['ds tra lk xac', 'tra linh kien xac', 'return carcass'],
        run: () => navigate(ROUTES.inventoryPartsReturnXac),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-ds-tra-lk-xac', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'part-return-xac-list',
      { branchId: filters.branchId, tinhTrang: filters.tinhTrang, maVanDon: filters.maVanDon },
    ],
    queryFn: () =>
      fetchPartReturnXacList({
        branchId: filters.branchId,
        tinhTrang: filters.tinhTrang,
        maVanDon: filters.maVanDon,
        pageSize: 300,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = usePartReturnXacColumns()

  const filteredRows = useMemo(
    () => applyClientFilters(data?.data ?? [], filters),
    [data?.data, filters],
  )
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagination: PaginationState = { pageIndex: page - 1, pageSize }

  const tongSoLK = filteredRows.reduce((s, r) => s + r.sl, 0)
  const selectedRows = filteredRows.filter((r) => rowSelection[r.id])

  function handleFilterChange(next: Partial<PartReturnXacFilterValues>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  const activeFilterCount = Object.values(filters).filter((v) => v != null && v !== '').length

  return (
    <div className="space-y-0">
      <PageHeader
        title="Danh Sách Trả Linh Kiện Xác"
        breadcrumbs={[
          { label: 'Quản Lý Kho', href: ROUTES.inventory },
          { label: 'Danh Sách Trả Linh Kiện Xác' },
        ]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel
          filterCount={activeFilterCount}
          onClear={() => setFilters({})}
          defaultExpanded
        >
          <PartReturnXacFilters filters={filters} onChange={handleFilterChange} />
        </FilterPanel>

        <KpiBox label="Tổng số LK" value={String(tongSoLK)} tone="green" className="w-fit" />

        <PartReturnXacBatchToolbar
          selected={selectedRows}
          allRows={filteredRows}
          onReload={() => refetch()}
        />

        <BulkActionsBar count={selectedRows.length} />

        <DataTable
          tableId={PART_RETURN_XAC_TABLE_ID}
          columns={columns}
          data={pageRows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có phiếu trả linh kiện xác nào"
          manualPagination
          pagination={pagination}
          pageCount={totalPages}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(r) => r.id}
          scrollLabel="Bảng danh sách trả linh kiện xác"
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
    </div>
  )
}

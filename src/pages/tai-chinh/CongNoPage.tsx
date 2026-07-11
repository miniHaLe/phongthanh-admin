/**
 * CongNoPage — per-ticket receivables settlement screen. Hand-composed
 * page-level DataTable (not CrudTablePage): 10 columns, NO checkbox column,
 * no create button, no KPI strip, no due-date concept. "Chọn" opens the
 * thanh-toán (settle-debt) modal. Route: /tai-chinh/cong-no
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { isWithinInterval, parseISO, subDays } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, DataTablePagination, PageHeader, FilterPanel } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { ROUTES } from '@/constants/routes'
import { congNoApi, CONG_NO_ROWS } from '@/mock/finance-mock'
import { formatVND, formatDate } from '@/lib/format'
import { ThanhToanCongNoModal } from '@/features/finance/thanh-toan-cong-no-modal'
import {
  LOAI_THANH_TOAN_OPTIONS,
  BRANCH_FILTER_OPTIONS,
  NGAY_TOGGLE_OPTIONS,
  type NgayToggle,
} from '@/config/finance-tables/cong-no.config'
import type { CongNo, LoaiPhieuCongNo } from '@/types/finance-types'

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 150, 200, 300]
const DEFAULT_PAGE_SIZE = 20
const TABLE_ID = 'cong-no'

interface CongNoFilters {
  branchId?: string
  loaiPhieu?: LoaiPhieuCongNo
  soPhieu?: string
  tenKhachHang?: string
  kyThuat?: string
  ngayToggle: NgayToggle
  dateFrom?: string
  dateTo?: string
}

const DEFAULT_FILTERS: CongNoFilters = {
  ngayToggle: 'tat_ca',
  dateFrom: subDays(new Date(), 30).toISOString().slice(0, 10),
  dateTo: new Date().toISOString().slice(0, 10),
}

function applyFilters(rows: CongNo[], f: CongNoFilters): CongNo[] {
  let out = rows
  if (f.branchId) out = out.filter((r) => r.branchId === f.branchId)
  if (f.loaiPhieu) out = out.filter((r) => r.loaiPhieu === f.loaiPhieu)
  if (f.soPhieu) {
    const q = f.soPhieu.toLowerCase()
    out = out.filter((r) => r.soPhieu.toLowerCase().includes(q))
  }
  if (f.tenKhachHang) {
    const q = f.tenKhachHang.toLowerCase()
    out = out.filter(
      (r) => r.tenKhachHang.toLowerCase().includes(q) || r.dienThoai.includes(f.tenKhachHang!),
    )
  }
  if (f.kyThuat) {
    const q = f.kyThuat.toLowerCase()
    out = out.filter((r) => r.kyThuat?.toLowerCase().includes(q))
  }
  if (f.ngayToggle === 'theo_ngay' && (f.dateFrom || f.dateTo)) {
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

export default function CongNoPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<CongNoFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [settleRow, setSettleRow] = useState<CongNo | null>(null)

  const commands = useMemo(
    () => [
      {
        id: 'nav-cong-no',
        label: 'Mở Công Nợ',
        group: 'Tài chính & Kho',
        keywords: ['cong no', 'phai thu', 'thanh toan'],
        run: () => navigate(ROUTES.financeReceivables),
      },
    ],
    [navigate],
  )
  useRegisterCommands('page-cong-no', commands)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cong-no-list', filters],
    queryFn: async () => {
      await congNoApi.list({ page: 1, pageSize: CONG_NO_ROWS.length })
      return applyFilters(CONG_NO_ROWS, filters)
    },
    placeholderData: keepPreviousData,
  })

  const filteredRows = data ?? []
  const total = filteredRows.length
  const start = (page - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleFilterChange(patch: Partial<CongNoFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'ngayToggle' && v != null && v !== '',
  ).length

  const columns = useMemo<ColumnDef<CongNo, unknown>[]>(
    () => [
      { id: 'soPhieu', accessorKey: 'soPhieu', header: 'Số phiếu' },
      { id: 'loaiPhieu', accessorKey: 'loaiPhieu', header: 'Loại phiếu' },
      {
        id: 'ngayLap',
        header: 'Ngày lập',
        cell: ({ row }) => formatDate(row.original.ngayLap),
      },
      { id: 'kyThuat', header: 'KTV', cell: ({ row }) => row.original.kyThuat ?? '—' },
      {
        id: 'soTien',
        header: 'Số tiền',
        cell: ({ row }) => formatVND(row.original.soTien),
      },
      {
        id: 'daTra',
        header: 'Đã trả',
        cell: ({ row }) => formatVND(row.original.daTra),
      },
      {
        id: 'conLai',
        header: 'Còn lại',
        cell: ({ row }) => formatVND(row.original.conLai),
      },
      { id: 'tenKhachHang', accessorKey: 'tenKhachHang', header: 'Tên khách hàng' },
      { id: 'dienThoai', accessorKey: 'dienThoai', header: 'Điện thoại' },
      {
        id: 'chon',
        header: 'Chọn',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            className="h-11 md:h-7"
            onClick={() => setSettleRow(row.original)}
          >
            Thanh toán
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-0">
      <PageHeader
        title="Công Nợ"
        breadcrumbs={[{ label: 'Tài Chính', href: ROUTES.finance }, { label: 'Công Nợ' }]}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <FilterPanel filterCount={activeFilterCount} onClear={() => setFilters(DEFAULT_FILTERS)} defaultExpanded>
          <Select
            value={filters.branchId ?? '__all__'}
            onValueChange={(v) => handleFilterChange({ branchId: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger aria-label="Chi nhánh">
              <SelectValue placeholder="Chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả chi nhánh</SelectItem>
              {BRANCH_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.loaiPhieu ?? '__all__'}
            onValueChange={(v) =>
              handleFilterChange({
                loaiPhieu: v === '__all__' ? undefined : (v as LoaiPhieuCongNo),
              })
            }
          >
            <SelectTrigger aria-label="Loại thanh toán">
              <SelectValue placeholder="Loại thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả loại</SelectItem>
              {LOAI_THANH_TOAN_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Số phiếu"
            value={filters.soPhieu ?? ''}
            onChange={(e) => handleFilterChange({ soPhieu: e.target.value || undefined })}
          />

          <Input
            placeholder="Tên/ĐT khách hàng"
            value={filters.tenKhachHang ?? ''}
            onChange={(e) => handleFilterChange({ tenKhachHang: e.target.value || undefined })}
          />

          <Input
            placeholder="Kỹ thuật"
            value={filters.kyThuat ?? ''}
            onChange={(e) => handleFilterChange({ kyThuat: e.target.value || undefined })}
          />

          <Select
            value={filters.ngayToggle}
            onValueChange={(v) => handleFilterChange({ ngayToggle: v as NgayToggle })}
          >
            <SelectTrigger aria-label="Tất cả / Theo ngày">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NGAY_TOGGLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filters.ngayToggle === 'theo_ngay' && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
              <Input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => handleFilterChange({ dateFrom: e.target.value || undefined })}
                aria-label="Từ ngày"
              />
              <span className="hidden text-center text-muted-foreground sm:block">–</span>
              <Input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => handleFilterChange({ dateTo: e.target.value || undefined })}
                aria-label="Đến ngày"
              />
            </div>
          )}
        </FilterPanel>

        <DataTable
          tableId={TABLE_ID}
          columns={columns}
          data={pageRows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyMessage="Không có công nợ nào"
          manualPagination
          pagination={{ pageIndex: page - 1, pageSize }}
          pageCount={totalPages}
          scrollLabel="Bảng công nợ"
          tableClassName="min-w-[1120px]"
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

      <ThanhToanCongNoModal
        row={settleRow}
        onOpenChange={(open) => {
          if (!open) setSettleRow(null)
        }}
        onSettled={() => {
          setSettleRow(null)
          void refetch()
        }}
      />
    </div>
  )
}

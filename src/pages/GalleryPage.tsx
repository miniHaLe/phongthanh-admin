import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Wrench, Users, DollarSign, Package } from 'lucide-react'
import {
  StatusBadge,
  StatusLegend,
  StatCard,
  EmptyState,
  ThemeToggle,
  BranchSwitcher,
  PrintMenu,
  SheetModal,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  DataTableColumnConfig,
  FilterPanel,
  SavedViews,
  notify,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { REPAIR_STATUSES, type RepairStatusId } from '@/domains/repair/status'
import { formatVND } from '@/lib/format'

interface DemoRow {
  id: string
  code: string
  customer: string
  status: RepairStatusId
  amount: number
}

const DEMO_ROWS: DemoRow[] = REPAIR_STATUSES.slice(0, 8).map((s, i) => ({
  id: String(i + 1),
  code: `PSC-${2260 + i}`,
  customer: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'][i % 4],
  status: s.id,
  amount: (i + 1) * 350_000,
}))

const DEMO_COLUMNS: ColumnDef<DemoRow, unknown>[] = [
  { accessorKey: 'code', header: 'Phiếu SC' },
  { accessorKey: 'customer', header: 'Khách hàng' },
  {
    accessorKey: 'status',
    header: 'Tình trạng',
    cell: ({ row }) => <StatusBadge status={row.original.status} showStrip />,
  },
  {
    accessorKey: 'amount',
    header: 'Chi phí',
    cell: ({ row }) => formatVND(row.original.amount),
  },
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

/**
 * /gallery — Phase 1 acceptance surface. Renders every shared component in
 * isolation so light/dark rendering and states can be eyeballed.
 */
export default function GalleryPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterExpanded] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thư viện giao diện</h1>
        <div className="flex items-center gap-2">
          <BranchSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <Section title="Trạng thái (15 trạng thái)">
        <StatusLegend />
        <div className="flex flex-wrap gap-2">
          {REPAIR_STATUSES.map((s) => (
            <StatusBadge key={s.id} status={s.id} showStrip />
          ))}
        </div>
      </Section>

      <Section title="Thẻ chỉ số (StatCard)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Phiếu chờ xử lý"
            value={128}
            icon={Wrench}
            delta={{ value: 12, label: '+12 so với hôm qua' }}
          />
          <StatCard
            label="Khách hàng mới"
            value={34}
            icon={Users}
            delta={{ value: -3, label: '-3 so với hôm qua' }}
          />
          <StatCard
            label="Doanh thu"
            value={formatVND(45_800_000)}
            icon={DollarSign}
          />
          <StatCard label="Đang tải" value={0} icon={Package} isLoading />
        </div>
      </Section>

      <Section title="Bộ lọc + Saved views">
        <FilterPanel
          filterCount={search ? 1 : 0}
          onClear={() => setSearch('')}
          defaultExpanded={filterExpanded}
          savedViewsSlot={
            <SavedViews
              tableId="gallery-demo"
              currentFilters={{ search }}
              onApply={(f) => setSearch(String(f.search ?? ''))}
            />
          }
        >
          <Input
            placeholder="Số phiếu / Khách hàng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterPanel>
      </Section>

      <Section title="Bảng dữ liệu (DataTable)">
        <DataTable
          tableId="gallery-demo"
          columns={DEMO_COLUMNS}
          data={DEMO_ROWS}
          toolbar={
            <DataTableToolbar
              searchValue={search}
              onSearchChange={setSearch}
              right={
                <>
                  <DataTableColumnConfig
                    tableId="gallery-demo"
                    columns={[
                      { id: 'code', label: 'Phiếu SC' },
                      { id: 'customer', label: 'Khách hàng' },
                      { id: 'status', label: 'Tình trạng' },
                      { id: 'amount', label: 'Chi phí' },
                    ]}
                  />
                  <PrintMenu
                    items={[
                      {
                        label: 'In biên nhận',
                        onSelect: () => notify.info('Đang chuẩn bị bản in…'),
                      },
                      {
                        label: 'In phiếu SC',
                        onSelect: () => notify.info('Đang chuẩn bị bản in…'),
                      },
                    ]}
                  />
                </>
              }
            />
          }
        />
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          total={DEMO_ROWS.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Section>

      <Section title="Trạng thái rỗng / lỗi">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border">
            <EmptyState heading="Không có dữ liệu" body="Chưa có phiếu nào." />
          </div>
          <div className="rounded-lg border">
            <DataTable
              tableId="gallery-error"
              columns={DEMO_COLUMNS}
              data={[]}
              isError
              onRetry={() => notify.success('Đã thử lại')}
            />
          </div>
        </div>
      </Section>

      <Section title="Thao tác (Toast · Sheet)">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => notify.success()}>Toast thành công</Button>
          <Button variant="destructive" onClick={() => notify.error()}>
            Toast lỗi
          </Button>
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            Mở Sheet
          </Button>
        </div>
        <SheetModal
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Bảng trượt mẫu"
          description="Ví dụ SheetModal dùng cho form tạo/sửa."
          footer={<Button onClick={() => setSheetOpen(false)}>Đóng</Button>}
        >
          <p className="text-sm text-muted-foreground">
            Nội dung form sẽ được đặt ở đây.
          </p>
        </SheetModal>
      </Section>
    </div>
  )
}

/** /thong-bao — legacy RepairingStatusHistory list with search/export tooling. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { DataTable, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { LOI_SUA_CHUA, MANUFACTURERS } from '@/domains/repair/reference-data'
import { exportToXlsx, type ExportColumn } from '@/lib/export-xlsx'
import { formatDateTime } from '@/lib/format'
import { useNotificationStore } from '@/store/notification-store'

interface NotificationRow {
  id: string
  repairId: string
  manufacturer: string
  receiptNumber: string
  repairContent: string
  createdBy: string
  createdAt: string
  isSeen: boolean
}

const EXPORT_COLUMNS: ExportColumn<NotificationRow>[] = [
  { header: 'Nhà sản xuất', accessor: (row) => row.manufacturer },
  { header: 'Số tiếp nhận', accessor: (row) => row.receiptNumber },
  { header: 'NDSC', accessor: (row) => row.repairContent },
  { header: 'Người tạo', accessor: (row) => row.createdBy },
  {
    header: 'Ngày tạo',
    accessor: (row) => formatDateTime(row.createdAt),
  },
  { header: 'Xem', accessor: (row) => (row.isSeen ? 'Đã xem' : 'Chưa xem') },
]

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('vi')
}

export default function ThongBaoPage() {
  const navigate = useNavigate()
  const notifications = useNotificationStore((state) => state.notifications)
  const seenIds = useNotificationStore((state) => state.seenIds)
  const markSeen = useNotificationStore((state) => state.markSeen)
  const markAllSeen = useNotificationStore((state) => state.markAllSeen)
  const [query, setQuery] = useState('')
  const [unseenOnly, setUnseenOnly] = useState(false)
  const seen = useMemo(() => new Set(seenIds), [seenIds])

  const rows = useMemo<NotificationRow[]>(() => {
    const tickets = new Map(MOCK_TICKETS.map((ticket) => [ticket.id, ticket]))
    return notifications.map((notification) => {
      const ticket = tickets.get(notification.repairId)
      const manufacturer = MANUFACTURERS.find(
        (item) => item.id === ticket?.nhaSanXuatId,
      )
      const repairErrors = ticket?.loiSuaChua
        .map((id) => LOI_SUA_CHUA.find((item) => item.id === id)?.ten)
        .filter(Boolean)
        .join(', ')
      return {
        id: notification.id,
        repairId: notification.repairId,
        manufacturer: manufacturer?.ten ?? '—',
        receiptNumber: notification.phieuCode,
        repairContent:
          ticket?.noiDungSuaChua || repairErrors || ticket?.moTaLoi || '—',
        createdBy: notification.changedBy,
        createdAt: notification.at,
        isSeen: seen.has(notification.id),
      }
    })
  }, [notifications, seen])

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalize(query)
    return rows.filter((row) => {
      if (unseenOnly && row.isSeen) return false
      if (!normalizedQuery) return true
      return normalize(
        `${row.manufacturer} ${row.receiptNumber} ${row.repairContent} ${row.createdBy}`,
      ).includes(normalizedQuery)
    })
  }, [query, rows, unseenOnly])

  const columns = useMemo<ColumnDef<NotificationRow, unknown>[]>(
    () => [
      {
        id: 'manufacturer',
        accessorKey: 'manufacturer',
        header: 'Nhà sản xuất',
      },
      {
        id: 'receiptNumber',
        accessorKey: 'receiptNumber',
        header: 'Số tiếp nhận',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold">
            {row.original.receiptNumber}
          </span>
        ),
      },
      { id: 'repairContent', accessorKey: 'repairContent', header: 'NDSC' },
      { id: 'createdBy', accessorKey: 'createdBy', header: 'Người tạo' },
      {
        id: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: 'view',
        header: 'Xem',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Xem ${row.original.receiptNumber}`}
            onClick={() => {
              markSeen(row.original.id)
              navigate(ROUTES.repairDetail(row.original.repairId))
            }}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [markSeen, navigate],
  )

  return (
    <div>
      <PageHeader
        title="Thông báo"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Thông báo' },
        ]}
      >
        <Button variant="outline" size="sm" onClick={markAllSeen}>
          Đánh dấu tất cả là đã đọc
        </Button>
      </PageHeader>

      <div className="space-y-3 p-4 lg:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="search"
            aria-label="Tìm kiếm"
            placeholder="Tìm kiếm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-64 flex-1"
          />
          <Button
            type="button"
            variant={unseenOnly ? 'default' : 'outline'}
            aria-pressed={unseenOnly}
            onClick={() => setUnseenOnly((value) => !value)}
          >
            Chưa xem
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void exportToXlsx({
                filename: 'thong-bao-tinh-trang-sua-chua',
                sheetName: 'Thông báo',
                columns: EXPORT_COLUMNS,
                rows: filteredRows,
              })
            }
          >
            Xuất ra Excel
          </Button>
        </div>

        <DataTable
          tableId="thong-bao"
          columns={columns}
          data={filteredRows}
          getRowId={(row) => row.id}
          emptyMessage="Không có thông báo"
        />
      </div>
    </div>
  )
}

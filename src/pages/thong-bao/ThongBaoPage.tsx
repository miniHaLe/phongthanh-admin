/**
 * /thong-bao — notification list (RepairingStatusHistory analog). Columns
 * inferred from the bell-dropdown item anatomy (Unresolved #1). Status pill uses
 * the legacy hex background per the §5b render rule; row click → repair detail.
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, DataTable, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useNotificationStore } from '@/store/notification-store'
import { formatDateTime } from '@/lib/format'
import type { NotificationItem } from '@/mock/notifications-mock'
import { getVisibleRowNumber } from '@/components/shared/data-table/visible-row-number'

export default function ThongBaoPage() {
  const navigate = useNavigate()
  const notifications = useNotificationStore((s) => s.notifications)
  const seenIds = useNotificationStore((s) => s.seenIds)
  const markAllSeen = useNotificationStore((s) => s.markAllSeen)
  const seen = useMemo(() => new Set(seenIds), [seenIds])

  const columns = useMemo<ColumnDef<NotificationItem, unknown>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: ({ row, table }) => (
          <span className="text-muted-foreground">
            {getVisibleRowNumber(table, row)}
          </span>
        ),
      },
      {
        id: 'phieu',
        accessorKey: 'phieuCode',
        header: 'Phiếu sửa chữa',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold">
            {row.original.phieuCode}
          </span>
        ),
      },
      {
        id: 'tinhTrang',
        header: 'Tình trạng',
        cell: ({ row }) => (
          <StatusBadge status={row.original.statusId} variant="solid" />
        ),
      },
      { id: 'nguoiDoi', accessorKey: 'changedBy', header: 'Người đổi' },
      {
        id: 'thoiGian',
        header: 'Thời gian',
        cell: ({ row }) => formatDateTime(row.original.at),
      },
      {
        id: 'daXem',
        header: 'Đã xem',
        cell: ({ row }) => (seen.has(row.original.id) ? '✓' : '—'),
      },
    ],
    [seen],
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
      <div className="p-4 lg:p-6">
        <DataTable
          tableId="thong-bao"
          columns={columns}
          data={notifications}
          onRowClick={(n) => navigate(ROUTES.repairDetail(n.repairId))}
        />
      </div>
    </div>
  )
}

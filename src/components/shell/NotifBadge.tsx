/**
 * Notification bell — store-driven. Shows the unseen count, a header
 * "Đánh dấu tất cả là đã đọc" action, and status-colored items (legacy hex).
 * Footer "Danh sách" → /thong-bao. Item click → repair detail + mark seen.
 */
import { Bell, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants/routes'
import { useNotificationStore } from '@/store/notification-store'
import { labelOf, hexOf } from '@/domains/repair/status'
import { formatDateTime } from '@/lib/format'

export function NotifBadge() {
  const navigate = useNavigate()
  const notifications = useNotificationStore((s) => s.notifications)
  const seenIds = useNotificationStore((s) => s.seenIds)
  const markSeen = useNotificationStore((s) => s.markSeen)
  const markAllSeen = useNotificationStore((s) => s.markAllSeen)

  const seen = new Set(seenIds)
  const unseen = notifications.filter((n) => !seen.has(n.id)).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Thông báo (${unseen} mới)`}
          className="relative"
        >
          <Bell className="size-5" />
          {unseen > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
            >
              {unseen}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 font-semibold">
            Thông báo ({unseen} mới)
          </DropdownMenuLabel>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={markAllSeen}
          >
            Đánh dấu tất cả là đã đọc
          </button>
        </div>
        <DropdownMenuSeparator />
        {notifications.slice(0, 8).map((n) => {
          const isSeen = seen.has(n.id)
          return (
            <DropdownMenuItem
              key={n.id}
              className="flex items-start gap-2 py-2"
              onClick={() => {
                markSeen(n.id)
                navigate(ROUTES.repairDetail(n.repairId))
              }}
            >
              <span
                className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: hexOf(n.statusId) }}
                aria-hidden="true"
              />
              <span className="flex flex-col gap-0.5">
                <span className={isSeen ? 'text-sm' : 'text-sm font-semibold'}>
                  {n.phieuCode} — {labelOf(n.statusId)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {n.changedBy} · {formatDateTime(n.at)}
                </span>
              </span>
              {!isSeen && (
                <Check className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm text-primary"
          onClick={() => navigate(ROUTES.notifications)}
        >
          Danh sách
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

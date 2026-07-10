/**
 * News dropdown (envelope icon, blue badge). Unread items are bold; each has a
 * "Đánh dấu là đã xem" check action. Footer "Danh sách" → /tin-tuc; item click →
 * /tin-tuc/:id.
 */
import { Mail, Check } from 'lucide-react'
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
import { formatDateTime } from '@/lib/format'

export function NewsBadge() {
  const navigate = useNavigate()
  const news = useNotificationStore((s) => s.news)
  const seenNewsIds = useNotificationStore((s) => s.seenNewsIds)
  const markNewsSeen = useNotificationStore((s) => s.markNewsSeen)
  const markAllNewsSeen = useNotificationStore((s) => s.markAllNewsSeen)

  const seen = new Set(seenNewsIds)
  const unseen = news.filter((n) => !seen.has(n.id)).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Tin tức (${unseen} mới)`}
          className="relative"
        >
          <Mail className="size-5" />
          {unseen > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white"
            >
              {unseen}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 font-semibold">
            Tin tức ({unseen} mới)
          </DropdownMenuLabel>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={markAllNewsSeen}
          >
            Đánh dấu tất cả là đã đọc
          </button>
        </div>
        <DropdownMenuSeparator />
        {news.slice(0, 8).map((n) => {
          const isSeen = seen.has(n.id)
          return (
            <DropdownMenuItem
              key={n.id}
              className="flex items-start gap-2 py-2"
              onClick={() => {
                markNewsSeen(n.id)
                navigate(ROUTES.newsDetail(n.id))
              }}
            >
              <button
                type="button"
                aria-label="Đánh dấu là đã xem"
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  markNewsSeen(n.id)
                }}
              >
                <Check className="size-4" />
              </button>
              <span className="flex flex-col gap-0.5">
                <span className={isSeen ? 'text-sm' : 'text-sm font-bold'}>
                  {n.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {n.author} · {formatDateTime(n.at)}
                </span>
              </span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm text-primary"
          onClick={() => navigate(ROUTES.news)}
        >
          Danh sách
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

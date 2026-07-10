/**
 * /tin-tuc — news list. Layout inferred from the news-dropdown item anatomy
 * (Unresolved #2): title / author / datetime / body, unread bold, per-item
 * "Đánh dấu là đã xem"; row click → detail.
 */
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useNotificationStore } from '@/store/notification-store'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function TinTucPage() {
  const news = useNotificationStore((s) => s.news)
  const seenNewsIds = useNotificationStore((s) => s.seenNewsIds)
  const markNewsSeen = useNotificationStore((s) => s.markNewsSeen)
  const seen = new Set(seenNewsIds)

  return (
    <div>
      <PageHeader
        title="Tin tức"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Tin tức' },
        ]}
      />
      <div className="space-y-2 p-4 lg:p-6">
        {news.map((n) => {
          const isSeen = seen.has(n.id)
          return (
            <article
              key={n.id}
              className="flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-left hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={ROUTES.newsDetail(n.id)}
                  className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => markNewsSeen(n.id)}
                >
                  <p className={cn('truncate', !isSeen && 'font-bold')}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.author} · {formatDateTime(n.at)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {n.body}
                  </p>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Đánh dấu là đã xem"
                onClick={(e) => {
                  e.stopPropagation()
                  markNewsSeen(n.id)
                }}
              >
                <Check className="size-4" />
              </Button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

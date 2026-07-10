/**
 * /tin-tuc/:id — news detail. Shows title/author/date/body and, when the item
 * links a repair, a "Xem phiếu sửa chữa" link. Marks the item seen on mount.
 */
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared'
import { FileWarning } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useNotificationStore } from '@/store/notification-store'
import { formatDateTime } from '@/lib/format'

export default function TinTucDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const news = useNotificationStore((s) => s.news)
  const markNewsSeen = useNotificationStore((s) => s.markNewsSeen)
  const item = news.find((n) => n.id === id)

  useEffect(() => {
    if (item) markNewsSeen(item.id)
  }, [item, markNewsSeen])

  if (!item) {
    return (
      <div className="p-6">
        <EmptyState icon={FileWarning} heading="Không tìm thấy tin tức" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={item.title}
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Tin tức', href: ROUTES.news },
          { label: 'Chi tiết' },
        ]}
      />
      <div className="p-4 lg:p-6">
        <article className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            {item.author} · {formatDateTime(item.at)}
          </p>
          <p className="mt-4 whitespace-pre-wrap">{item.body}</p>
          {item.repairId && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate(ROUTES.repairDetail(item.repairId!))}
            >
              Xem phiếu sửa chữa
            </Button>
          )}
        </article>
      </div>
    </div>
  )
}

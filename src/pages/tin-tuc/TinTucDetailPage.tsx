import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getTinTuc, TIN_TUC_QUERY_KEY } from '@/api/tin-tuc-api'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'
import { formatDateTime } from '@/lib/format'

export default function TinTucDetailPage() {
  const { id } = useParams<{ id: string }>()
  const newsQuery = useQuery({
    queryKey: [...TIN_TUC_QUERY_KEY, 'detail', id],
    queryFn: () => getTinTuc(id ?? ''),
    enabled: Boolean(id),
  })

  if (newsQuery.isLoading) {
    return (
      <div className="space-y-4 p-4 lg:p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (newsQuery.isError || !newsQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-muted-foreground">
          Không tìm thấy tin nhắn
        </p>
        <Button asChild variant="outline">
          <Link to={ROUTES.news}>
            <ArrowLeft className="mr-2 size-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    )
  }

  const item = newsQuery.data

  return (
    <div>
      <PageHeader
        title={item.title}
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Tin nhắn', href: ROUTES.news },
          { label: item.title },
        ]}
      >
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.news}>
            <ArrowLeft className="mr-2 size-4" />
            Danh sách
          </Link>
        </Button>
      </PageHeader>

      <div className="p-4 lg:p-6">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>{item.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {item.author} · {formatDateTime(item.createdAt)}
            </p>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-7">{item.body}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

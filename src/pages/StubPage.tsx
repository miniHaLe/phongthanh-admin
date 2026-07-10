import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/shared'

interface StubPageProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

/**
 * Generic placeholder for routes not yet built by their owning phase.
 * Prevents a blank screen and shows the section name + breadcrumb.
 */
export default function StubPage({ title, breadcrumbs }: StubPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        breadcrumbs={
          breadcrumbs ?? [
            { label: 'Trang chủ', href: '/trang-chu' },
            { label: title },
          ]
        }
      />
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
        <Construction className="size-12 opacity-50" aria-hidden="true" />
        <p className="text-sm">
          Đang phát triển — “{title}” sẽ sớm hoàn thiện.
        </p>
      </div>
    </div>
  )
}

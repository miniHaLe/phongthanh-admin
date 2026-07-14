import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
      <FileQuestion
        className="size-12 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Không tìm thấy trang</h1>
        <p className="text-sm text-muted-foreground">
          Đường dẫn này không tồn tại hoặc đã được chuyển sang vị trí khác.
        </p>
      </div>
      <Button asChild>
        <Link to={ROUTES.home}>Về trang chủ</Link>
      </Button>
    </div>
  )
}

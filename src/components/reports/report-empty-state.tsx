/**
 * Two empty states for reports (Phase 7 — owned exclusively):
 * 1. Pre-run: "Vui lòng nhấn Tìm kiếm" (hasRun=false)
 * 2. Zero-result: "Không có dữ liệu" (hasRun=true, rows=[])
 */
import { Search, CalendarX2 } from 'lucide-react'
import { EmptyState } from '@/components/shared'

interface ReportEmptyStateProps {
  hasRun: boolean
  onSearch?: () => void
}

export function ReportEmptyState({ hasRun, onSearch }: ReportEmptyStateProps) {
  if (!hasRun) {
    return (
      <EmptyState
        icon={Search}
        heading="Vui lòng nhấn Tìm kiếm để hiện kết quả!"
        body="Chọn bộ lọc và nhấn nút Tìm kiếm để xem báo cáo."
        action={
          onSearch ? { label: 'Tìm kiếm ngay', onClick: onSearch } : undefined
        }
        className="min-h-[280px]"
      />
    )
  }

  return (
    <EmptyState
      icon={CalendarX2}
      heading="Không có dữ liệu phù hợp với bộ lọc đã chọn"
      body="Thử thay đổi khoảng thời gian hoặc điều kiện lọc."
      className="min-h-[280px]"
    />
  )
}

/**
 * Bulk-actions bar — renders "Đã chọn N dòng" plus a slot of action buttons.
 * Renders nothing when the selection is empty. Fed to the DataTable `toolbar`
 * slot by pages that opt into row selection.
 */
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BulkActionsBarProps {
  count: number
  children?: ReactNode
  className?: string
}

export function BulkActionsBar({
  count,
  children,
  className,
}: BulkActionsBarProps) {
  if (count <= 0) return null
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm',
        className,
      )}
      role="region"
      aria-label="Thao tác hàng loạt"
    >
      <span className="font-medium">Đã chọn {count} dòng</span>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  )
}

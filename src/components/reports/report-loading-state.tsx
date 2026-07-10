/**
 * Skeleton loading state for the report results area (Phase 7 — owned exclusively).
 * Shows skeleton rows inside the result area while query is in-flight.
 */
import { Skeleton } from '@/components/ui/skeleton'

interface ReportLoadingStateProps {
  /** Number of skeleton rows to render (default 8). */
  rows?: number
  /** Number of skeleton columns to render (default 6). */
  cols?: number
}

export function ReportLoadingState({
  rows = 8,
  cols = 6,
}: ReportLoadingStateProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      {/* Header skeleton */}
      <div className="flex gap-3 border-b bg-muted/50 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 border-b px-4 py-3 last:border-0">
          {Array.from({ length: cols }).map((__, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

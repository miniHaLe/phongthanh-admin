/**
 * WorkQueueTile — single KPI tile for a repair-status work queue bucket.
 * Hover: ring + scale. Click: navigate to filtered repair list.
 * Keyboard: focusable, Enter/Space trigger nav.
 */

import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface WorkQueueTileProps {
  label: string
  count: number
  icon: LucideIcon
  /** Tailwind classes for icon bg + text color */
  colorClass: string
  trend: number
  /** Full href — navigate on click */
  href: string
}

export function WorkQueueTile({
  label,
  count,
  icon: Icon,
  colorClass,
  trend,
  href,
}: WorkQueueTileProps) {
  const navigate = useNavigate()

  function handleActivate() {
    navigate(href)
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleActivate()
        }
      }}
      className="cursor-pointer transition-all hover:scale-[1.02] hover:ring-2 hover:ring-ring hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{count}</p>

            {/* Trend row — hidden when trend is exactly 0 */}
            {trend !== 0 && (
              <div
                className={cn(
                  'mt-1.5 flex items-center gap-1 text-xs font-medium',
                  trend > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive',
                )}
              >
                {trend > 0 ? (
                  <TrendingUp
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <TrendingDown
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>
                  {trend > 0 ? '+' : ''}
                  {trend} so với hôm qua
                </span>
              </div>
            )}
          </div>

          {/* Icon badge */}
          <div className={cn('shrink-0 rounded-lg p-2.5', colorClass)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

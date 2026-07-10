/**
 * TodayReceiptsTile — accent tile showing tickets received today.
 * Full-width on mobile, 1/4 width on xl alongside work-queue tiles.
 */

import { TrendingUp, TrendingDown, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TodayReceiptsTileProps {
  count: number
  trend: number
}

export function TodayReceiptsTile({ count, trend }: TodayReceiptsTileProps) {
  const trendPositive = trend > 0
  const showTrend = trend !== 0

  return (
    <Card className="min-h-[128px] border-indigo-200 bg-indigo-50 dark:border-indigo-500/25 dark:bg-indigo-500/10 min-[1920px]:min-h-[148px]">
      <CardContent className="p-5 min-[1920px]:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Phiếu nhận hôm nay
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-indigo-900 dark:text-indigo-100 min-[1920px]:text-4xl">
              {count}
            </p>

            {showTrend && (
              <div
                className={cn(
                  'mt-1.5 flex items-center gap-1 text-xs font-medium',
                  trendPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive',
                )}
              >
                {trendPositive ? (
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
                <span className="leading-snug">
                  {trendPositive ? '+' : ''}
                  {trend} so với hôm qua
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 rounded-lg bg-indigo-100 p-2.5 dark:bg-indigo-500/20 min-[1920px]:p-3">
            <ClipboardList
              className="h-5 w-5 text-indigo-600 dark:text-indigo-400 min-[1920px]:h-6 min-[1920px]:w-6"
              aria-hidden="true"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

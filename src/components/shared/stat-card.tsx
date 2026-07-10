import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardDelta {
  value: number
  label: string
}

interface StatCardProps {
  label: string
  value: string | number
  delta?: StatCardDelta
  icon?: LucideIcon
  isLoading?: boolean
  onClick?: () => void
  className?: string
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  isLoading,
  onClick,
  className,
}: StatCardProps) {
  const isClickable = Boolean(onClick)

  return (
    <Card
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn(
        'transition-shadow',
        isClickable &&
          'cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Label */}
            <p className="truncate text-sm text-muted-foreground">{label}</p>

            {/* Value */}
            {isLoading ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <p className="mt-1 text-2xl font-semibold leading-tight">
                {value}
              </p>
            )}

            {/* Delta row */}
            {!isLoading && delta !== undefined && (
              <div
                className={cn(
                  'mt-1.5 flex items-center gap-1 text-xs font-medium',
                  delta.value >= 0 ? 'text-emerald-600' : 'text-destructive',
                )}
              >
                {delta.value >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{delta.label}</span>
              </div>
            )}

            {/* Loading delta placeholder */}
            {isLoading && <Skeleton className="mt-2 h-4 w-16" />}
          </div>

          {/* Optional icon */}
          {Icon && !isLoading && (
            <div className="shrink-0 rounded-lg bg-muted p-2.5">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          {isLoading && Icon && (
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

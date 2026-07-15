import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, TriangleAlert } from 'lucide-react'
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

function numericValue(value: string | number): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const normalized = value
    .trim()
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function compactValue(value: string | number): string {
  const numeric = numericValue(value)
  if (numeric === null || Math.abs(numeric) < 1_000_000) return String(value)

  const compact = new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 2,
  })
    .format(numeric)
    .replace(/^-/, '−')
    .replace(/\s*T$/i, ' tỷ')
  const currency = typeof value === 'string' && /[₫đ]/i.test(value) ? ' ₫' : ''
  return `${compact}${currency}`
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
  const isNegative = (numericValue(value) ?? 0) < 0
  const DisplayIcon = isNegative ? TriangleAlert : Icon

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
        className,
        isClickable &&
          'cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isNegative &&
          'border-destructive/50 !border-l-destructive bg-destructive/5',
      )}
      data-negative={isNegative ? '' : undefined}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Label */}
            <p className="text-sm leading-snug text-muted-foreground">
              {label}
            </p>

            {/* Value */}
            {isLoading ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <p
                className={cn(
                  'mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold tabular-nums leading-tight tracking-tight sm:text-2xl',
                  isNegative && 'text-destructive',
                )}
                aria-label={String(value)}
              >
                <span className="sm:hidden">{compactValue(value)}</span>
                <span className="hidden sm:inline">{value}</span>
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
          {DisplayIcon && !isLoading && (
            <div
              className={cn(
                'shrink-0 rounded-lg bg-muted p-2.5',
                isNegative && 'bg-destructive/10',
              )}
            >
              <DisplayIcon
                className={cn(
                  'h-5 w-5 text-muted-foreground',
                  isNegative && 'text-destructive',
                )}
                aria-hidden="true"
              />
              {isNegative && <span className="sr-only">Giá trị âm</span>}
            </div>
          )}

          {isLoading && DisplayIcon && (
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

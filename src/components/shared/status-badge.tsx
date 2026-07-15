import { cn } from '@/lib/utils'
import { labelOf, hexOf, type RepairStatusId } from '@/domains/repair/status'

interface StatusBadgeProps {
  status: RepairStatusId
  variant?: 'pill' | 'table' | 'solid'
  /** Render a colored left strip before the label. */
  showStrip?: boolean
  className?: string
}

/**
 * Status pill. Color is the status's fixed legacy hex (C2 — the reference has
 * no dark mode; each status carries one hex). The label is the status text.
 * The full reference td render (hex background + white uppercase pill) is P3.
 */
export function StatusBadge({
  status,
  variant = 'pill',
  showStrip = false,
  className,
}: StatusBadgeProps) {
  const hex = hexOf(status)
  const label = labelOf(status)

  if (variant === 'table') {
    return (
      <div
        className={cn(
          'flex min-h-11 items-center justify-center px-1',
          className,
        )}
        style={{ backgroundColor: hex }}
        data-status-id={status}
        data-status-variant={variant}
      >
        <span className="line-clamp-2 rounded bg-background/90 px-1.5 py-0.5 text-center text-xs font-bold uppercase leading-tight text-foreground shadow-sm ring-1 ring-border/60">
          {label}
        </span>
      </div>
    )
  }

  if (variant === 'solid') {
    return (
      <span
        className={cn(
          'inline-block rounded px-2 py-0.5 text-xs font-bold uppercase text-white',
          className,
        )}
        style={{ backgroundColor: hex }}
        data-status-id={status}
        data-status-variant={variant}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
      data-status-id={status}
      data-status-variant={variant}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      {showStrip && (
        <span
          className="h-3 w-1 rounded-full"
          style={{ backgroundColor: hex }}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  )
}

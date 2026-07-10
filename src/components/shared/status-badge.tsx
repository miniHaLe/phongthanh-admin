import { cn } from '@/lib/utils'
import { labelOf, hexOf, type RepairStatusId } from '@/domains/repair/status'

interface StatusBadgeProps {
  status: RepairStatusId
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
  showStrip = false,
  className,
}: StatusBadgeProps) {
  const hex = hexOf(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
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
      {labelOf(status)}
    </span>
  )
}

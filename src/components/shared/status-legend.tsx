import { cn } from '@/lib/utils'
import {
  REPAIR_STATUSES,
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_LABEL,
  STATUS_HEX,
  type RepairStatusId,
} from '@/domains/repair/status'

interface StatusLegendProps {
  className?: string
  /** When present, appends "(count)" to each status label (repair-list legend). */
  counts?: Record<number, number>
  /** Fired when a legend entry is clicked (status filter). */
  onSelect?: (id: RepairStatusId) => void
}

/**
 * Status legend. Without `counts`, lists the 15 statuses in id order with hex
 * swatches. With `counts`, renders them in the repair-list display order as
 * `Label (count)` colored squares — the Index_8 legend strip.
 */
export function StatusLegend({ className, counts, onSelect }: StatusLegendProps) {
  const order = counts ? REPAIR_STATUS_DISPLAY_ORDER : REPAIR_STATUSES.map((s) => s.id)

  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}
      aria-label="Chú thích màu trạng thái"
    >
      {order.map((id) => {
        const label = STATUS_LABEL[id]
        const text = counts ? `${label} (${counts[id] ?? 0})` : label
        const content = (
          <>
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: STATUS_HEX[id] }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{text}</span>
          </>
        )
        return onSelect ? (
          <button
            key={id}
            type="button"
            className="flex items-center gap-1.5 text-xs hover:text-foreground"
            onClick={() => onSelect(id)}
          >
            {content}
          </button>
        ) : (
          <div key={id} className="flex items-center gap-1.5 text-xs">
            {content}
          </div>
        )
      })}
    </div>
  )
}

/**
 * LowStockAlert — scrollable list of parts below reorder threshold.
 * Red badge for qty=0, amber for low. Empty state when stock is healthy.
 */

import { CheckCircle2, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LowStockItem } from '@/types/dashboard-types'

interface LowStockAlertProps {
  items: LowStockItem[]
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" aria-hidden="true" />
        <p className="text-sm font-medium">Kho hàng ổn định</p>
        <p className="text-xs">Không có linh kiện nào sắp hết hàng</p>
      </div>
    )
  }

  return (
    <ul className="max-h-48 divide-y overflow-y-auto" role="list">
      {items.map((item) => {
        const isEmpty = item.currentQty === 0
        return (
          <li
            key={item.partId}
            className="flex items-center justify-between gap-3 px-1 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Package
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.partName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.warehouseName}
                </p>
              </div>
            </div>

            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                isEmpty
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
              )}
              title={`Tồn kho: ${item.currentQty} / Ngưỡng: ${item.reorderLevel}`}
            >
              {item.currentQty}/{item.reorderLevel}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

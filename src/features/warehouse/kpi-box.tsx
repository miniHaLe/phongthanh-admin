/**
 * Small colored info-box for a single warehouse KPI value (Tổng tiền, Tổng số
 * LK, …). Local to the warehouse feature — do NOT reuse
 * `components/finance/inventory-kpi-strip.tsx` (owned by another phase).
 */
import { cn } from '@/lib/utils'

export type KpiTone = 'blue' | 'yellow' | 'green'

const TONE_CLASSES: Record<KpiTone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100',
  yellow:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
  green:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
}

interface KpiBoxProps {
  label: string
  value: string
  tone: KpiTone
  className?: string
}

export function KpiBox({ label, value, tone, className }: KpiBoxProps) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3',
        TONE_CLASSES[tone],
        className,
      )}
    >
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

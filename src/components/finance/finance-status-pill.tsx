/**
 * Status pills for finance/inventory domains.
 * These are NOT repair statuses — dedicated local helper per spec.
 * Colors: Cho duyet/Cho xac nhan = amber, Da duyet/Hoan thanh/Da xuat/Da tra = emerald, Huy = rose.
 */
import { cn } from '@/lib/utils'

type StatusVariant = 'amber' | 'emerald' | 'rose' | 'blue' | 'gray'

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  amber:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  emerald:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
}

function resolveVariant(status: string): StatusVariant {
  const s = status.toLowerCase()
  if (
    s.includes('cho duyet') ||
    s.includes('cho xac nhan') ||
    s.includes('cho thanh toan') ||
    s.includes('con no')
  )
    return 'amber'
  if (
    s.includes('da duyet') ||
    s.includes('hoan thanh') ||
    s.includes('da xuat') ||
    s.includes('da thanh toan') ||
    s.includes('da tra')
  )
    return 'emerald'
  if (s.includes('huy')) return 'rose'
  if (s.includes('qua han')) return 'rose'
  if (s.includes('phai thu')) return 'blue'
  if (s.includes('phai tra')) return 'amber'
  return 'gray'
}

interface FinanceStatusPillProps {
  status: string
  className?: string
}

export function FinanceStatusPill({
  status,
  className,
}: FinanceStatusPillProps) {
  const variant = resolveVariant(status)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {status}
    </span>
  )
}

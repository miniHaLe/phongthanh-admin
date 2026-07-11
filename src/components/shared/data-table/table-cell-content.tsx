import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

export interface TableProtectedValueProps extends ComponentPropsWithoutRef<'span'> {
  tabular?: boolean
}

/** Values that must expand the inner table instead of wrapping or clipping. */
export function TableProtectedValue({
  tabular = false,
  className,
  ...props
}: TableProtectedValueProps) {
  return (
    <span
      data-table-protected
      className={cn(
        'inline-block max-w-none overflow-visible whitespace-nowrap',
        tabular && 'tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

export interface TableDescriptionProps extends ComponentPropsWithoutRef<'span'> {
  value?: string
}

/** Deliberately clamps prose while keeping the complete value accessible. */
export function TableDescription({
  value,
  children,
  className,
  title,
  ...props
}: TableDescriptionProps) {
  const fullValue =
    value ?? (typeof children === 'string' ? children : undefined)

  return (
    <span
      className={cn('line-clamp-2 min-w-0 break-words', className)}
      title={title ?? fullValue}
      aria-label={fullValue}
      {...props}
    >
      {children ?? value}
    </span>
  )
}

export type TableMetaStackProps = ComponentPropsWithoutRef<'div'>

/** Compact label/value rows shared by composite table cells. */
export function TableMetaStack({ className, ...props }: TableMetaStackProps) {
  return (
    <div
      className={cn(
        'grid min-w-0 grid-cols-[max-content_minmax(min-content,1fr)] items-start gap-x-2 gap-y-0.5',
        className,
      )}
      {...props}
    />
  )
}

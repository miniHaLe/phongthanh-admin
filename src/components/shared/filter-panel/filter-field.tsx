import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const filterFieldsGridClassName =
  'col-span-full grid min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4'

interface FilterFieldProps {
  label: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function FilterField({
  label,
  htmlFor,
  children,
  className,
}: FilterFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

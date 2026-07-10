import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  heading: string
  body?: string
  action?: { label: string; onClick: () => void }
  /** Extra content (e.g. a custom CTA) rendered below the action. */
  children?: React.ReactNode
  className?: string
}

/** Centered zero-data / error placeholder. Icon + heading + optional body/action. */
export function EmptyState({
  icon: Icon = Inbox,
  heading,
  body,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-6 py-10 text-center',
        className,
      )}
    >
      <Icon className="size-10 text-muted-foreground/60" aria-hidden="true" />
      <h3 className="text-sm font-medium">{heading}</h3>
      {body && <p className="max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export type SheetModalSize = 'sm' | 'md' | 'lg' | 'full'

export interface SheetModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: SheetModalSize
  children: React.ReactNode
  footer?: React.ReactNode
}

/** Maps size prop to a max-width override applied on top of the sheet's base style. */
const SIZE_CLASS: Record<SheetModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  full: 'sm:max-w-2xl',
}

/**
 * Right-side sheet modal with a sticky header, scrollable body, and an
 * optional pinned footer. Delegates open/close state to the parent.
 */
export function SheetModal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}: SheetModalProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <SheetContent
        side="right"
        className={cn('flex h-full flex-col p-0', SIZE_CLASS[size])}
      >
        {/* Sticky header */}
        <SheetHeader className="shrink-0 border-b border-border px-6 py-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Optional pinned footer */}
        {footer && (
          <SheetFooter className="shrink-0 border-t border-border px-6 py-4">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

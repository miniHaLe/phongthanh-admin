import { useId, useState } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface FilterPanelProps {
  children: React.ReactNode
  onClear: () => void
  filterCount: number
  defaultExpanded?: boolean
  savedViewsSlot?: React.ReactNode
  triggerLabel?: string
  contentClassName?: string
}

/**
 * Collapsible filter panel. Header: toggle button with filter count badge,
 * "Xóa bộ lọc" action, and an optional saved-views slot. Body: responsive
 * 1-2-3 column grid of filter controls passed as children.
 */
export function FilterPanel({
  children,
  onClear,
  filterCount,
  defaultExpanded = false,
  savedViewsSlot,
  triggerLabel = 'Bộ lọc',
  contentClassName,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const contentId = useId()

  return (
    <div
      className="rounded-lg border border-border bg-card"
      data-filter-panel=""
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
        {/* Toggle button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 gap-1.5 px-2 font-medium md:h-8"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{triggerLabel}</span>
          {/* Badge only when collapsed and there are active filters */}
          {!expanded && filterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[20px] px-1.5 text-xs"
            >
              {filterCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Saved-views slot (e.g. <SavedViews>) */}
        {savedViewsSlot}

        {/* Clear button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 gap-1 px-2 text-muted-foreground md:h-8"
          onClick={onClear}
          disabled={filterCount === 0}
        >
          <X className="h-3.5 w-3.5" />
          Xóa bộ lọc
        </Button>
      </div>

      {/* Collapsible body */}
      {expanded && (
        <div id={contentId} className="border-t border-border px-4 py-3">
          <div
            className={cn(
              'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

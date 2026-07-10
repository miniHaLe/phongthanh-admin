import { useState } from 'react'
import { Bookmark, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useFilterState } from '@/components/shared/filter-panel/use-filter-state'

export interface SavedViewsProps {
  tableId: string
  currentFilters: Record<string, unknown>
  onApply: (filters: Record<string, unknown>) => void
}

/**
 * Popover that lets users save the current filter state as a named view and
 * restore or delete previously saved views. Uses `useFilterState` for
 * persistence.
 */
export function SavedViews({
  tableId,
  currentFilters,
  onApply,
}: SavedViewsProps) {
  const [name, setName] = useState('')
  const { addView, removeView, getViews } = useFilterState()
  const views = getViews(tableId)

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    // crypto.randomUUID() and new Date() called at runtime (user action) — safe.
    addView(tableId, {
      id: crypto.randomUUID(),
      label: trimmed,
      filters: currentFilters,
      createdAt: new Date().toISOString(),
    })
    setName('')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-11 gap-1.5 md:h-8">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">Lưu / Xem bộ lọc</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-3">
        {/* Save current filters */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Lưu bộ lọc hiện tại
        </p>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên view…"
            className="h-11 flex-1 text-base md:h-8 md:text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
            }}
          />
          <Button
            size="sm"
            className="h-11 whitespace-nowrap md:h-8"
            disabled={name.trim() === ''}
            onClick={handleSave}
          >
            Lưu
          </Button>
        </div>

        <Separator className="my-3" />

        {/* Saved view list */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          View đã lưu
        </p>

        {views.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            Chưa có view nào đã lưu
          </p>
        ) : (
          <ul className="space-y-1">
            {views.map((view) => (
              <li
                key={view.id}
                className="flex items-center justify-between gap-2 rounded-md px-1 py-1 hover:bg-muted"
              >
                <button
                  type="button"
                  className="min-h-11 flex-1 truncate text-left text-base md:min-h-0 md:text-sm"
                  onClick={() => onApply(view.filters)}
                  title={`Áp dụng: ${view.label}`}
                >
                  {view.label}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive md:h-6 md:w-6"
                  onClick={() => removeView(tableId, view.id)}
                  aria-label={`Xóa view "${view.label}"`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

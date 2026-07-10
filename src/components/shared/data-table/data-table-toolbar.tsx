import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface DataTableToolbarProps {
  searchValue?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  left?: React.ReactNode
  right?: React.ReactNode
  children?: React.ReactNode
}

/**
 * Toolbar row for data tables. Left area: optional search input + `left` slot.
 * Spacer in the middle. Right area: `right` slot, then `children`.
 */
export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm…',
  left,
  right,
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search input — rendered only when caller supplies onSearchChange */}
      {onSearchChange !== undefined && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-56 pl-8 text-sm"
          />
        </div>
      )}

      {/* Caller-supplied left slot (e.g. filter chips) */}
      {left}

      {/* Flexible spacer pushes right content to the end */}
      <div className="flex-1" />

      {/* Caller-supplied right slot (e.g. column config button) */}
      {right}

      {/* Additional children after right slot */}
      {children}
    </div>
  )
}

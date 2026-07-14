import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SEARCH_DEBOUNCE_MS = 300

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
  const [localSearchValue, setLocalSearchValue] = useState(searchValue ?? '')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalSearchValue(searchValue ?? '')
    clearTimeout(searchTimeoutRef.current)
  }, [searchValue])

  useEffect(
    () => () => {
      clearTimeout(searchTimeoutRef.current)
    },
    [],
  )

  function handleSearchChange(nextValue: string) {
    setLocalSearchValue(nextValue)
    clearTimeout(searchTimeoutRef.current)

    if (nextValue === '') {
      onSearchChange?.('')
      return
    }

    searchTimeoutRef.current = setTimeout(
      () => onSearchChange?.(nextValue),
      SEARCH_DEBOUNCE_MS,
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search input — rendered only when caller supplies onSearchChange */}
      {onSearchChange !== undefined && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={localSearchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full px-8 text-base md:h-8 md:w-56 md:text-sm"
          />
          {localSearchValue !== '' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 h-10 w-10 -translate-y-1/2 text-muted-foreground hover:text-foreground md:h-7 md:w-7"
              aria-label="Xóa tìm kiếm"
              onClick={() => {
                handleSearchChange('')
                searchInputRef.current?.focus()
              }}
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          )}
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

import type { ReactNode } from 'react'
import type { Table } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface CompositeSortOption {
  id: string
  label: string
}

export interface CompositeSortHeaderProps<TData> {
  table: Table<TData>
  label: ReactNode
  accessibleLabel: string
  options: readonly CompositeSortOption[]
}

/** Lets one visible composite column select among hidden legacy sort fields. */
export function CompositeSortHeader<TData>({
  table,
  label,
  accessibleLabel,
  options,
}: CompositeSortHeaderProps<TData>) {
  const activeOption = options.find((option) =>
    table.getColumn(option.id)?.getIsSorted(),
  )
  const activeDirection = activeOption
    ? table.getColumn(activeOption.id)?.getIsSorted()
    : false
  const directionLabel =
    activeDirection === 'asc'
      ? 'tăng dần'
      : activeDirection === 'desc'
        ? 'giảm dần'
        : null
  const triggerLabel = activeOption
    ? `Sắp xếp nhóm ${accessibleLabel}; đang theo ${activeOption.label}, ${directionLabel}`
    : `Chọn cách sắp xếp nhóm ${accessibleLabel}`

  if (options.length === 1) {
    const column = table.getColumn(options[0].id)
    return (
      <button
        type="button"
        data-table-sort-target
        className="inline-flex min-h-11 w-full min-w-11 items-center justify-between gap-1 whitespace-normal text-left hover:text-foreground lg:min-h-0 lg:min-w-0"
        disabled={!column?.getCanSort()}
        onClick={() => column?.toggleSorting(undefined, false)}
        aria-label={`Sắp xếp theo cột ${accessibleLabel}`}
      >
        <span className="min-w-0">{label}</span>
        {activeDirection === 'asc' ? (
          <ArrowUp className="size-3.5 shrink-0" />
        ) : activeDirection === 'desc' ? (
          <ArrowDown className="size-3.5 shrink-0" />
        ) : (
          <ArrowUpDown className="size-3.5 shrink-0 opacity-40" />
        )}
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-table-sort-target
          className="inline-flex min-h-11 w-full min-w-11 items-center justify-between gap-1 whitespace-normal text-left hover:text-foreground lg:min-h-0 lg:min-w-0"
          aria-label={triggerLabel}
        >
          <span className="min-w-0">{label}</span>
          {activeDirection === 'asc' ? (
            <ArrowUp className="size-3.5 shrink-0" />
          ) : activeDirection === 'desc' ? (
            <ArrowDown className="size-3.5 shrink-0" />
          ) : (
            <ArrowUpDown className="size-3.5 shrink-0 opacity-40" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => {
          const column = table.getColumn(option.id)
          const direction = column?.getIsSorted()
          return (
            <DropdownMenuItem
              key={option.id}
              className="min-h-11 lg:min-h-8"
              disabled={!column?.getCanSort()}
              aria-label={`Sắp xếp theo ${option.label}`}
              onSelect={() => column?.toggleSorting(undefined, false)}
            >
              <span>{option.label}</span>
              {direction === 'asc' ? (
                <ArrowUp className="ml-auto" aria-label="Tăng dần" />
              ) : direction === 'desc' ? (
                <ArrowDown className="ml-auto" aria-label="Giảm dần" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

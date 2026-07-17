import { Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  useTableState,
  type Density,
} from '@/components/shared/data-table/use-table-state'
import { useWideViewport } from './use-wide-viewport'
import type { ColumnPresentation } from './data-table'

export interface ColumnDescriptor {
  id: string
  label: string
  initiallyHidden?: boolean
  presentation?: ColumnPresentation
}

export interface DataTableColumnConfigProps {
  tableId: string
  columns: ColumnDescriptor[]
}

/**
 * Popover button (Settings2 icon) that lets the user toggle column visibility
 * and switch between comfortable / compact row density. Changes are persisted
 * via the `useTableState` Zustand slice.
 */
export function DataTableColumnConfig({
  tableId,
  columns,
}: DataTableColumnConfigProps) {
  const { getTable, setColumnVisibility, setDensity, resetTable } =
    useTableState()
  const tableState = getTable(tableId)
  const { columnVisibility, density } = tableState
  const visibleColumns = columns.filter(
    (column) => column.presentation !== 'sort-only',
  )
  // Must mirror data-table.tsx's columnVisibility memo: initiallyHidden only
  // seeds `false` below the wide breakpoint; persisted entries always win.
  const isWideViewport = useWideViewport()

  /**
   * A column is considered visible unless `columnVisibility[id]` is explicitly
   * `false` (matching TanStack Table convention).
   */
  function isVisible(column: ColumnDescriptor): boolean {
    return (
      columnVisibility[column.id] ??
      (isWideViewport || !column.initiallyHidden)
    )
  }

  function toggleColumn(column: ColumnDescriptor) {
    setColumnVisibility(tableId, {
      ...columnVisibility,
      [column.id]: !isVisible(column),
    })
  }

  const hiddenColumns = visibleColumns.filter((column) => !isVisible(column))
  const hiddenCount = hiddenColumns.length

  /** Persist an explicit `true` per hidden id so the choice survives reloads. */
  function showAllColumns() {
    setColumnVisibility(tableId, {
      ...columnVisibility,
      ...Object.fromEntries(hiddenColumns.map((column) => [column.id, true])),
    })
  }

  function handleDensity(d: Density) {
    setDensity(tableId, d)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-11 gap-1.5 lg:h-8"
          title={
            hiddenCount > 0
              ? `Cấu hình cột (${hiddenCount} cột đang ẩn)`
              : 'Cấu hình cột'
          }
          aria-label={
            hiddenCount > 0
              ? `Cấu hình cột (${hiddenCount} cột đang ẩn)`
              : 'Cấu hình cột'
          }
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Cột</span>
          {/* Badge hidden below sm — icon-only state conveys the count via
              aria-label/title, keeping the 390px compact toolbar intact. */}
          {hiddenCount > 0 && (
            <Badge
              variant="secondary"
              className="hidden h-5 min-w-[20px] px-1.5 text-xs sm:inline-flex"
            >
              {hiddenCount} ẩn
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-60 p-3">
        {/* Column visibility list */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Hiển thị cột
        </p>
        <ul className="space-y-1.5">
          {visibleColumns.map((col) => (
            <li key={col.id} className="flex items-center gap-2">
              <Checkbox
                id={`col-vis-${tableId}-${col.id}`}
                checked={isVisible(col)}
                onCheckedChange={() => toggleColumn(col)}
              />
              <label
                htmlFor={`col-vis-${tableId}-${col.id}`}
                className="cursor-pointer select-none text-sm"
              >
                {col.label}
              </label>
            </li>
          ))}
        </ul>

        <Separator className="my-3" />

        {/* Density toggle */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Mật độ hàng
        </p>
        <div className="flex gap-2">
          <Button
            variant={density === 'comfortable' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-sm md:text-xs"
            onClick={() => handleDensity('comfortable')}
          >
            Rộng
          </Button>
          <Button
            variant={density === 'compact' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-sm md:text-xs"
            onClick={() => handleDensity('compact')}
          >
            Gọn
          </Button>
        </div>

        <Separator className="my-3" />

        {/* Show all + Reset */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-sm md:text-xs"
          disabled={hiddenCount === 0}
          onClick={showAllColumns}
        >
          Hiện tất cả
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-sm text-muted-foreground md:text-xs"
          onClick={() => resetTable(tableId)}
        >
          Đặt lại mặc định
        </Button>
      </PopoverContent>
    </Popover>
  )
}

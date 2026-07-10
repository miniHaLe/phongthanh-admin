import { Settings2 } from 'lucide-react'
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

export interface ColumnDescriptor {
  id: string
  label: string
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

  /**
   * A column is considered visible unless `columnVisibility[id]` is explicitly
   * `false` (matching TanStack Table convention).
   */
  function isVisible(colId: string): boolean {
    return columnVisibility[colId] !== false
  }

  function toggleColumn(colId: string) {
    setColumnVisibility(tableId, {
      ...columnVisibility,
      [colId]: !isVisible(colId),
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
          className="h-11 gap-1.5 md:h-8"
          title="Cấu hình cột"
          aria-label="Cấu hình cột"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Cột</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-60 p-3">
        {/* Column visibility list */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Hiển thị cột
        </p>
        <ul className="space-y-1.5">
          {columns.map((col) => (
            <li key={col.id} className="flex items-center gap-2">
              <Checkbox
                id={`col-vis-${tableId}-${col.id}`}
                checked={isVisible(col.id)}
                onCheckedChange={() => toggleColumn(col.id)}
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

        {/* Reset */}
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

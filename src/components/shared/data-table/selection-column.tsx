/**
 * Reusable checkbox selection column for the DataTable. `buildSelectionColumn`
 * returns a TanStack column def whose header selects/deselects the page and
 * whose cell toggles a single row. Cell clicks stopPropagation so row selection
 * never triggers the table's `onRowClick` navigation.
 */
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function buildSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Checkbox
                aria-label="Chọn tất cả"
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(v) =>
                  table.toggleAllPageRowsSelected(!!v)
                }
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">Chọn tất cả</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    cell: ({ row }) => (
      <span
        className="inline-flex"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <Checkbox
          aria-label="Chọn dòng"
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      </span>
    ),
  }
}

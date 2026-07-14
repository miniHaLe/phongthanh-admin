import { Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { buildSelectionColumn } from '@/components/shared/data-table/selection-column'
import { getVisibleRowNumber } from '@/components/shared/data-table/visible-row-number'
import type { CrudConfig, CrudLookups, ListParams } from '@/types/crud-types'

export interface CrudColumnActions<T> {
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
}

export interface CrudColumnDescriptor {
  id: string
  label: string
  initiallyHidden?: boolean
}

export function buildCrudColumnDescriptors<T extends { id: string }>(
  config: CrudConfig<T>,
): CrudColumnDescriptor[] {
  return config.columns.map((column) => ({
    id: String(column.key),
    label: column.header,
    initiallyHidden: column.hidden,
  }))
}

export function buildCrudColumns<T extends { id: string }>(
  config: CrudConfig<T>,
  params: Pick<ListParams, 'page' | 'pageSize'>,
  actions: CrudColumnActions<T>,
  lookups?: CrudLookups,
): ColumnDef<T, unknown>[] {
  const actionCount =
    Number(Boolean(actions.onEdit)) + Number(Boolean(actions.onDelete))

  return [
    ...(config.bulkDelete ? [buildSelectionColumn<T>()] : []),
    {
      id: 'stt',
      header: 'STT',
      cell: ({ row, table }) =>
        getVisibleRowNumber(table, row, (params.page - 1) * params.pageSize),
      enableSorting: false,
      size: 56,
      meta: { sticky: true },
    },
    ...config.columns.map((column): ColumnDef<T, unknown> => ({
      id: String(column.key),
      accessorKey: column.key as string,
      header: column.header,
      enableSorting: column.sortable ?? false,
      size: column.width,
      meta: { initiallyHidden: column.hidden },
      ...(column.renderCell
        ? {
            cell: ({ row }) =>
              column.renderCell!(
                (row.original as Record<string, unknown>)[
                  String(column.key)
                ] as T[keyof T],
                row.original,
                lookups,
              ),
          }
        : {}),
    })),
    ...(actionCount > 0
      ? [
          {
            id: '_actions',
            header: '',
            enableSorting: false,
            size: actionCount === 1 ? 60 : 88,
            cell: ({ row }) => (
              <div className="flex items-center gap-1">
                {actions.onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 md:h-7 md:w-7"
                    aria-label="Chỉnh sửa"
                    title="Chỉnh sửa"
                    onClick={(event) => {
                      event.stopPropagation()
                      actions.onEdit?.(row.original)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {actions.onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-destructive hover:text-destructive md:h-7 md:w-7"
                    aria-label="Xóa"
                    title="Xóa"
                    onClick={(event) => {
                      event.stopPropagation()
                      actions.onDelete?.(row.original)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ),
          } satisfies ColumnDef<T, unknown>,
        ]
      : []),
  ]
}

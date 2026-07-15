import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Cell,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type VisibilityState,
  type RowSelectionState,
  type OnChangeFn,
  type RowData,
} from '@tanstack/react-table'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Inbox,
  LoaderCircle,
} from 'lucide-react'
import { useTableState } from './use-table-state'
import { Button } from '@/components/ui/button'
import {
  CompositeSortHeader,
  type CompositeSortOption,
} from './composite-sort-header'

export type ColumnPresentation = 'visible' | 'sort-only'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    sticky?: boolean
    initiallyHidden?: boolean
    presentation?: ColumnPresentation
    compositeSortOptions?: readonly CompositeSortOption[]
  }
}

export type DataTableLayout = 'fixed' | 'content-safe'

export interface DataTableProps<TData> {
  /** Stable id for persisting column state. */
  tableId: string
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  /** Background request state; keeps current rows visible while refreshing. */
  isFetching?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyMessage?: string
  emptyAction?: React.ReactNode
  /** Controlled sorting (optional). */
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  /** Manual pagination flag (server-style). Rendering handled by parent via toolbar/pagination. */
  manualPagination?: boolean
  /** Preserve server-provided ordering instead of sorting the current page again. */
  manualSorting?: boolean
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number
  /** Toolbar slot rendered above the table. */
  toolbar?: React.ReactNode
  /** Row click handler (row navigation). */
  onRowClick?: (row: TData) => void
  /** Enable controlled row selection (opt-in). */
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** Stable row id resolver for selection keys (defaults to row index). */
  getRowId?: (row: TData, index: number) => string
  /** Extra className for the scroll container. */
  className?: string
  /** Accessible label for the horizontal table scroll region. */
  scrollLabel?: string
  /** Extra className for the inner table element, e.g. min-w-[1200px]. */
  tableClassName?: string
  /** Opt-in minimum inner-table width. Defaults to legacy fixed layout. */
  tableMinWidth?: number
  /** Content-safe mode treats explicit column sizes as minimums, never maximums. */
  tableLayout?: DataTableLayout
}

function getColumnDefId<TData>(column: ColumnDef<TData, unknown>) {
  return (
    column.id ??
    ('accessorKey' in column && typeof column.accessorKey === 'string'
      ? column.accessorKey.replaceAll('.', '_')
      : undefined)
  )
}

function flattenColumnDefs<TData>(columns: ColumnDef<TData, unknown>[]) {
  return columns.flatMap((column): ColumnDef<TData, unknown>[] => {
    if ('columns' in column && Array.isArray(column.columns)) {
      return [column, ...flattenColumnDefs(column.columns)]
    }
    return [column]
  })
}

function NormalizedCellValue<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const renderer = cell.column.columnDef.cell
  const context = cell.getContext()
  const value =
    typeof renderer === 'function'
      ? renderer(context)
      : flexRender(renderer, context)
  return value === '' || value === null || value === undefined ? '—' : value
}

/**
 * The ONE generic table (C3). TanStack headless + shadcn Table primitives.
 * Handles loading / empty / error states, sortable headers, sticky header,
 * column visibility (persisted per tableId), density.
 * Phase 4/5/6 supply column defs only — no bespoke table primitives.
 */
export function DataTable<TData>({
  tableId,
  columns,
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  emptyMessage = 'Không có dữ liệu',
  emptyAction,
  sorting,
  onSortingChange,
  manualPagination,
  manualSorting,
  pagination,
  onPaginationChange,
  pageCount,
  toolbar,
  onRowClick,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  className,
  scrollLabel = 'Bảng dữ liệu',
  tableClassName,
  tableMinWidth,
  tableLayout,
}: DataTableProps<TData>) {
  const persisted = useTableState((s) => s.tables[tableId])
  const density = persisted?.density ?? 'comfortable'
  const scrollFrameRef = useRef<HTMLDivElement | null>(null)
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  const flatColumns = useMemo(() => flattenColumnDefs(columns), [columns])
  const sortOnlyColumnIds = useMemo(
    () =>
      flatColumns.flatMap((column) => {
        const id = getColumnDefId(column)
        return column.meta?.presentation === 'sort-only' && id ? [id] : []
      }),
    [flatColumns],
  )
  const initiallyHiddenColumnIds = useMemo(
    () =>
      flatColumns.flatMap((column) => {
        const id = getColumnDefId(column)
        return column.meta?.initiallyHidden && id ? [id] : []
      }),
    [flatColumns],
  )
  const columnVisibility: VisibilityState = useMemo(
    () => ({
      ...Object.fromEntries(initiallyHiddenColumnIds.map((id) => [id, false])),
      ...(persisted?.columnVisibility ?? {}),
      ...Object.fromEntries(sortOnlyColumnIds.map((id) => [id, false])),
    }),
    [initiallyHiddenColumnIds, persisted?.columnVisibility, sortOnlyColumnIds],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      ...(sorting ? { sorting } : {}),
      columnVisibility,
      ...(pagination ? { pagination } : {}),
      ...(rowSelection ? { rowSelection } : {}),
    },
    onSortingChange,
    onPaginationChange,
    manualPagination,
    manualSorting,
    pageCount,
    enableRowSelection,
    onRowSelectionChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const cellPad = density === 'compact' ? 'px-1.5 py-1.5' : 'px-2.5 py-3'
  const headerPad = density === 'compact' ? 'px-1.5' : 'px-2.5'
  const resolvedTableLayout =
    tableMinWidth == null ? undefined : (tableLayout ?? 'fixed')
  const usesFitLayout = resolvedTableLayout === 'fixed'
  const usesContentSafeLayout = resolvedTableLayout === 'content-safe'
  const isBackgroundFetching = !!isFetching && !isLoading
  const visibleColCount = Math.max(1, table.getVisibleLeafColumns().length)
  const explicitColumnSizes = useMemo(
    () =>
      new Map(
        flatColumns.flatMap((column) => {
          if (typeof column.size !== 'number') return []
          const columnId = getColumnDefId(column)
          return columnId ? [[columnId, column.size] as const] : []
        }),
      ),
    [flatColumns],
  )

  function getColumnSizeStyle(columnId: string) {
    const columnSize = explicitColumnSizes.get(columnId)
    if (columnSize == null || resolvedTableLayout == null) return undefined
    if (usesContentSafeLayout) {
      return { minWidth: `${columnSize}px` }
    }
    return {
      width: `${columnSize}px`,
      minWidth: `${columnSize}px`,
      maxWidth: `${columnSize}px`,
    }
  }

  const updateScrollState = useCallback(() => {
    const el = scrollFrameRef.current
    if (!el) return

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    setScrollState({
      hasOverflow: maxScrollLeft > 1,
      canScrollLeft: el.scrollLeft > 1,
      canScrollRight: el.scrollLeft < maxScrollLeft - 1,
    })
  }, [])

  useEffect(() => {
    const el = scrollFrameRef.current
    if (!el) return

    updateScrollState()
    const raf = window.requestAnimationFrame(updateScrollState)
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateScrollState)
        : null

    observer?.observe(el)
    if (el.firstElementChild) observer?.observe(el.firstElementChild)
    window.addEventListener('resize', updateScrollState)

    return () => {
      window.cancelAnimationFrame(raf)
      observer?.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [data, updateScrollState, visibleColCount])

  function scrollTable(direction: 'left' | 'right') {
    const el = scrollFrameRef.current
    if (!el) return

    const left =
      direction === 'left'
        ? -Math.max(240, el.clientWidth * 0.75)
        : Math.max(240, el.clientWidth * 0.75)

    el.scrollBy({ left, behavior: 'smooth' })
    window.setTimeout(updateScrollState, 180)
  }

  function handleScrollKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const el = scrollFrameRef.current
    if (!el) return

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollTable('left')
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollTable('right')
    } else if (event.key === 'Home') {
      event.preventDefault()
      el.scrollTo({ left: 0, behavior: 'auto' })
      updateScrollState()
    } else if (event.key === 'End') {
      event.preventDefault()
      el.scrollTo({ left: el.scrollWidth, behavior: 'auto' })
      updateScrollState()
    }
  }

  return (
    <div className="space-y-3">
      {toolbar}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-card',
          className,
        )}
      >
        {scrollState.hasOverflow && (
          <div className="flex items-center justify-end gap-1 border-b bg-muted/30 px-2 py-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-table-scroll-button="left"
              aria-label="Cuộn bảng sang trái"
              disabled={!scrollState.canScrollLeft}
              onClick={() => scrollTable('left')}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-table-scroll-button="right"
              aria-label="Cuộn bảng sang phải"
              disabled={!scrollState.canScrollRight}
              onClick={() => scrollTable('right')}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
        {isBackgroundFetching && (
          <div
            role="status"
            aria-live="polite"
            data-table-fetch-indicator
            className={cn(
              'pointer-events-none absolute right-3 z-20 inline-flex items-center gap-1.5 rounded-md border bg-background/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur',
              scrollState.hasOverflow ? 'top-12' : 'top-3',
            )}
          >
            <LoaderCircle
              className="size-3.5 animate-spin"
              aria-hidden="true"
            />
            Đang cập nhật…
          </div>
        )}
        <div
          ref={scrollFrameRef}
          data-table-scroll-frame
          role="region"
          aria-label={scrollLabel}
          aria-busy={isLoading || isFetching || undefined}
          tabIndex={0}
          className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onScroll={updateScrollState}
          onKeyDown={handleScrollKeyDown}
        >
          <table
            data-table-fit-layout={resolvedTableLayout != null || undefined}
            data-table-layout={resolvedTableLayout}
            className={cn(
              'w-full caption-bottom text-sm transition-opacity',
              isBackgroundFetching && 'opacity-60',
              usesFitLayout && 'table-fixed',
              usesContentSafeLayout && 'table-auto',
              tableClassName,
            )}
            style={
              tableMinWidth ? { minWidth: `${tableMinWidth}px` } : undefined
            }
          >
            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sorted = header.column.getIsSorted()
                    const compositeSortOptions =
                      header.column.columnDef.meta?.compositeSortOptions
                    const usesCompositeSort =
                      (compositeSortOptions?.length ?? 0) > 0
                    const compositeSorted = compositeSortOptions
                      ?.map((option) =>
                        table.getColumn(option.id)?.getIsSorted(),
                      )
                      .find(Boolean)
                    const headerLabel =
                      typeof header.column.columnDef.header === 'string'
                        ? header.column.columnDef.header
                        : 'dữ liệu'
                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        className={cn(
                          headerPad,
                          'text-[13px] font-semibold leading-tight',
                          resolvedTableLayout != null
                            ? 'whitespace-normal'
                            : 'whitespace-nowrap',
                          header.column.id === 'select' && 'px-0',
                        )}
                        style={getColumnSizeStyle(header.column.id)}
                        aria-sort={
                          canSort || usesCompositeSort
                            ? (usesCompositeSort ? compositeSorted : sorted) ===
                              'asc'
                              ? 'ascending'
                              : (usesCompositeSort
                                    ? compositeSorted
                                    : sorted) === 'desc'
                                ? 'descending'
                                : 'none'
                            : undefined
                        }
                      >
                        {header.isPlaceholder ? null : usesCompositeSort ? (
                          <CompositeSortHeader
                            table={table}
                            label={flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            accessibleLabel={headerLabel}
                            options={compositeSortOptions!}
                          />
                        ) : canSort ? (
                          <button
                            type="button"
                            data-table-sort-target
                            className="inline-flex min-h-11 w-full min-w-11 items-center justify-between gap-1 whitespace-normal text-left hover:text-foreground lg:min-h-0 lg:min-w-0"
                            onClick={header.column.getToggleSortingHandler()}
                            aria-label={`Sắp xếp theo cột ${headerLabel}`}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sorted === 'asc' ? (
                              <ArrowUp className="size-3.5" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-40" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: visibleColCount }).map((__, j) => (
                      <TableCell key={j} className={cellPad}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={visibleColCount} className="h-64">
                    <EmptyState
                      icon={CircleAlert}
                      heading="Có lỗi xảy ra"
                      body="Không thể tải dữ liệu."
                      action={
                        onRetry
                          ? { label: 'Thử lại', onClick: onRetry }
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColCount} className="h-64">
                    <EmptyState
                      icon={Inbox}
                      heading={emptyMessage}
                      action={undefined}
                    >
                      {emptyAction}
                    </EmptyState>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(onRowClick && 'cursor-pointer')}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cellPad,
                          cell.column.id === 'select' && 'px-0',
                        )}
                        style={getColumnSizeStyle(cell.column.id)}
                      >
                        <NormalizedCellValue cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </table>
        </div>
      </div>
    </div>
  )
}

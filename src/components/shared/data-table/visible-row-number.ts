import type { Row, Table } from '@tanstack/react-table'

const visiblePositionCache = new WeakMap<object, ReadonlyMap<string, number>>()

/** Return the 1-based position in the current sorted/filtered row model. */
export function getVisibleRowNumber<TData>(
  table: Table<TData>,
  row: Row<TData>,
  paginationOffset = 0,
): number {
  const visibleRows = table.getRowModel().rows
  let positions = visiblePositionCache.get(visibleRows)

  if (!positions) {
    positions = new Map(
      visibleRows.map((visibleRow, index) => [visibleRow.id, index]),
    )
    visiblePositionCache.set(visibleRows, positions)
  }

  return paginationOffset + (positions.get(row.id) ?? row.index) + 1
}

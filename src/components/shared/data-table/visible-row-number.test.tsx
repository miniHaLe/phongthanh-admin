import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'
import { getVisibleRowNumber } from './visible-row-number'

interface TestRow {
  id: string
  name: string
}

const data: TestRow[] = [
  { id: 'z', name: 'Zulu' },
  { id: 'a', name: 'Alpha' },
]

const columns: ColumnDef<TestRow, unknown>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row, table }) => getVisibleRowNumber(table, row, 20),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Tên',
    enableSorting: true,
  },
]

function visibleRows() {
  return screen.getAllByRole('row').slice(1)
}

describe('getVisibleRowNumber', () => {
  it('numbers the current client-sorted order with the pagination offset', () => {
    render(
      <DataTable
        tableId="visible-row-client-sort"
        columns={columns}
        data={data}
        sorting={[{ id: 'name', desc: false }]}
      />,
    )

    const rows = visibleRows()
    expect(within(rows[0]).getAllByRole('cell')[0]).toHaveTextContent('21')
    expect(rows[0]).toHaveTextContent('Alpha')
    expect(within(rows[1]).getAllByRole('cell')[0]).toHaveTextContent('22')
    expect(rows[1]).toHaveTextContent('Zulu')
  })

  it('keeps manual server order while numbering that visible order', () => {
    render(
      <DataTable
        tableId="visible-row-manual-sort"
        columns={columns}
        data={data}
        sorting={[{ id: 'name', desc: false }]}
        manualSorting
      />,
    )

    const rows = visibleRows()
    expect(within(rows[0]).getAllByRole('cell')[0]).toHaveTextContent('21')
    expect(rows[0]).toHaveTextContent('Zulu')
    expect(within(rows[1]).getAllByRole('cell')[0]).toHaveTextContent('22')
    expect(rows[1]).toHaveTextContent('Alpha')
  })
})

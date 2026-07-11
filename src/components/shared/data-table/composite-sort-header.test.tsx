import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { DataTable } from './data-table'

interface Row {
  receivedAt: string
  completedAt: string
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    id: 'timeline',
    header: 'Thời gian',
    meta: {
      compositeSortOptions: [
        { id: 'receivedAt', label: 'Ngày nhận' },
        { id: 'completedAt', label: 'Ngày hoàn thành' },
      ],
    },
    cell: ({ row }) => row.original.receivedAt,
  },
  {
    id: 'receivedAt',
    accessorKey: 'receivedAt',
    enableSorting: true,
    meta: { presentation: 'sort-only' },
  },
  {
    id: 'completedAt',
    accessorKey: 'completedAt',
    enableSorting: true,
    meta: { presentation: 'sort-only' },
  },
]

function Harness() {
  const [sorting, setSorting] = useState<SortingState>([])
  return (
    <DataTable
      tableId="composite-sort"
      columns={columns}
      data={[
        { receivedAt: '2026-07-02', completedAt: '2026-07-03' },
        { receivedAt: '2026-07-01', completedAt: '2026-07-04' },
      ]}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  )
}

describe('CompositeSortHeader', () => {
  it('selects hidden sort IDs with a touch-safe accessible target', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const trigger = screen.getByRole('button', {
      name: 'Chọn cách sắp xếp nhóm Thời gian',
    })
    expect(trigger).toHaveAttribute('data-table-sort-target', 'true')
    expect(trigger).toHaveClass('min-h-11', 'min-w-11')

    await user.click(trigger)
    await user.click(
      screen.getByRole('menuitem', { name: 'Sắp xếp theo Ngày hoàn thành' }),
    )

    expect(
      screen.getByRole('button', {
        name: /đang theo Ngày hoàn thành, tăng dần/,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('columnheader')).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    expect(screen.queryByText('receivedAt')).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(1)
  })
})

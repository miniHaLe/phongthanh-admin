/** Characterization: DataTable core behavior survives the row-selection add. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'

interface Row {
  id: string
  name: string
}
const columns: ColumnDef<Row, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Tên' },
]
const data: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
]

describe('DataTable (characterization)', () => {
  it('renders headers and rows from column defs', () => {
    render(<DataTable tableId="t1" columns={columns} data={data} />)
    expect(screen.getByText('Tên')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows the empty state when there is no data', () => {
    render(<DataTable tableId="t2" columns={columns} data={[]} />)
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
  })

  it('fires onRowClick with the row original', async () => {
    const user = userEvent.setup()
    let clicked: Row | null = null
    render(
      <DataTable
        tableId="t3"
        columns={columns}
        data={data}
        onRowClick={(r) => (clicked = r)}
      />,
    )
    await user.click(screen.getByText('Alpha'))
    expect(clicked).toEqual({ id: 'a', name: 'Alpha' })
  })

  it('renders the toolbar slot', () => {
    render(
      <DataTable
        tableId="t4"
        columns={columns}
        data={data}
        toolbar={<div>TOOLBAR</div>}
      />,
    )
    expect(screen.getByText('TOOLBAR')).toBeInTheDocument()
  })
})

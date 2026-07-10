/** Spec: selection column header "Chọn tất cả", row checks build rowSelection. */
import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { DataTable } from './data-table'
import { buildSelectionColumn } from './selection-column'

interface Row {
  id: string
  name: string
}
const DATA: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
]

function Harness({ onRowClick }: { onRowClick?: (r: Row) => void }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const columns: ColumnDef<Row, unknown>[] = [
    buildSelectionColumn<Row>(),
    { id: 'name', accessorKey: 'name', header: 'Tên' },
  ]
  return (
    <>
      <div data-testid="count">{Object.keys(rowSelection).length}</div>
      <DataTable
        tableId="test-sel"
        columns={columns}
        data={DATA}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
      />
    </>
  )
}

describe('selection column', () => {
  it('header checkbox is labeled "Chọn tất cả"', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Chọn tất cả')).toBeInTheDocument()
  })

  it('checking two rows populates rowSelection with two keys', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    // Re-query between clicks — the table re-renders and replaces the nodes.
    await user.click(screen.getAllByLabelText('Chọn dòng')[0])
    await user.click(screen.getAllByLabelText('Chọn dòng')[1])
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  it('clicking a row checkbox does not fire onRowClick', async () => {
    const user = userEvent.setup()
    let clicked = 0
    render(<Harness onRowClick={() => (clicked += 1)} />)
    const rowChecks = screen.getAllByLabelText('Chọn dòng')
    await user.click(rowChecks[0])
    expect(clicked).toBe(0)
  })
})

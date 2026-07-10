/** Spec: LineItemEditor add/remove rows, totals recompute, Lưu / Lưu & Thêm mới. */
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LineItemEditor, type LineColumn } from './line-item-editor'

interface Line {
  qty: number
}

function Harness({ onSave }: { onSave: (o: { saveAndNew: boolean }) => void }) {
  const [lines, setLines] = useState<Line[]>([{ qty: 2 }])
  const columns: LineColumn<Line>[] = [
    {
      key: 'qty',
      header: 'SL',
      cell: (line) => <span>{line.qty}</span>,
    },
  ]
  return (
    <LineItemEditor
      columns={columns}
      lines={lines}
      onLinesChange={setLines}
      makeEmptyLine={() => ({ qty: 1 })}
      totals={[
        {
          key: 'sum',
          label: 'Tổng SL',
          compute: (ls) => <span data-testid="total">{ls.reduce((s, l) => s + l.qty, 0)}</span>,
        },
      ]}
      onSave={onSave}
    />
  )
}

describe('LineItemEditor', () => {
  it('renders "Lưu" and "Lưu & Thêm mới" buttons', () => {
    render(<Harness onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
  })

  it('adds a row via "Thêm dòng" and recomputes totals', async () => {
    const user = userEvent.setup()
    render(<Harness onSave={vi.fn()} />)
    expect(screen.getByTestId('total').textContent).toBe('2')
    await user.click(screen.getByRole('button', { name: 'Thêm dòng' }))
    expect(screen.getByTestId('total').textContent).toBe('3') // 2 + new(1)
  })

  it('removes a row', async () => {
    const user = userEvent.setup()
    render(<Harness onSave={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Thêm dòng' }))
    await user.click(screen.getAllByLabelText('Xóa dòng')[0])
    expect(screen.getByTestId('total').textContent).toBe('1')
  })

  it('onSave receives { saveAndNew } per button', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<Harness onSave={onSave} />)
    await user.click(screen.getByRole('button', { name: 'Lưu & Thêm mới' }))
    expect(onSave).toHaveBeenCalledWith({ saveAndNew: true })
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(onSave).toHaveBeenCalledWith({ saveAndNew: false })
  })
})

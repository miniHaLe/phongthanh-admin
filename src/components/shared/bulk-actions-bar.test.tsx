/** Spec: BulkActionsBar shows "Đã chọn N dòng" + actions, hidden when empty. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BulkActionsBar } from './bulk-actions-bar'

describe('BulkActionsBar', () => {
  it('shows the selected count and renders passed actions', () => {
    render(
      <BulkActionsBar count={2}>
        <button>Xóa</button>
      </BulkActionsBar>,
    )
    expect(screen.getByText('Đã chọn 2 dòng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument()
  })

  it('renders nothing when selection is empty', () => {
    const { container } = render(<BulkActionsBar count={0} />)
    expect(container).toBeEmptyDOMElement()
  })
})

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchX } from 'lucide-react'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('announces its message and runs the configured action', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <EmptyState
        icon={SearchX}
        heading="Không tìm thấy kết quả"
        body="Thử xóa điều kiện tìm kiếm."
        action={{ label: 'Xóa bộ lọc', onClick: onClear }}
      />,
    )

    expect(screen.getByRole('status')).toHaveAttribute('data-empty-state')
    expect(screen.getByText('Thử xóa điều kiện tìm kiếm.')).toBeInTheDocument()
    const action = screen.getByRole('button', { name: 'Xóa bộ lọc' })
    expect(action).toHaveAttribute('type', 'button')
    await user.click(action)
    expect(onClear).toHaveBeenCalledOnce()
  })
})

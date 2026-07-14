import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterPanel } from './filter-panel'

describe('FilterPanel', () => {
  it('provides an accessible custom disclosure and clear action', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <FilterPanel
        triggerLabel="Thông tin tìm kiếm"
        filterCount={2}
        onClear={onClear}
      >
        <label>
          Số phiếu
          <input />
        </label>
      </FilterPanel>,
    )

    const disclosure = screen.getByRole('button', {
      name: /Thông tin tìm kiếm/,
    })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(disclosure).toHaveAttribute('aria-controls')

    await user.click(disclosure)
    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByLabelText('Số phiếu')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})

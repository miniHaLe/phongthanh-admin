import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFilterState } from '@/components/shared/filter-panel/use-filter-state'
import type { RepairListFilters } from '@/domains/repair/types'
import { RepairFilters } from './RepairFilters'

beforeEach(() => {
  useFilterState.setState({ views: {} })
})

describe('RepairFilters', () => {
  it('uses FilterPanel anatomy and keeps the advanced disclosure', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onClear = vi.fn()
    const onSearch = vi.fn()
    const onReload = vi.fn()
    render(
      <RepairFilters
        filters={{ soPhieu: 'PSC-001' }}
        activeFilterCount={1}
        onChange={onChange}
        onClear={onClear}
        onSearch={onSearch}
        onReload={onReload}
      />,
    )

    expect(document.querySelector('[data-filter-panel]')).toBeInTheDocument()
    expect(screen.getByLabelText('Số phiếu')).toHaveFocus()
    expect(screen.getByLabelText('Số phiếu')).toHaveValue('PSC-001')
    const dateRange = document.querySelector('[data-repair-date-range]')
    expect(dateRange).toHaveClass(
      'grid-cols-1',
      'md:grid-cols-[1fr_auto_1fr]',
      'lg:flex-none',
    )
    const dateInputs = dateRange?.querySelectorAll('input[type="date"]')
    expect(dateInputs).toHaveLength(2)
    for (const input of dateInputs ?? []) {
      expect(input).toHaveClass('lg:w-40', 'lg:shrink-0')
    }
    expect(screen.getByText('–')).toHaveClass('hidden', 'md:block')
    expect(
      screen.getByRole('button', { name: 'Lưu / Xem bộ lọc' }),
    ).toBeInTheDocument()

    const advancedButton = screen.getByRole('button', {
      name: 'Bộ lọc nâng cao',
    })
    const advancedId = advancedButton.getAttribute('aria-controls')!
    expect(document.getElementById(advancedId)).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    await user.click(advancedButton)
    expect(document.getElementById(advancedId)).toHaveAttribute(
      'aria-hidden',
      'false',
    )
    expect(screen.getByLabelText('Tên khu vực')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    expect(onClear).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    expect(onSearch).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Tải lại trang' }))
    expect(onReload).toHaveBeenCalledOnce()
  })

  it('continues to apply saved repair filter views', async () => {
    const user = userEvent.setup()
    const savedFilters: RepairListFilters = { soSerial: 'SERIAL-001' }
    useFilterState.setState({
      views: {
        'repair-list': [
          {
            id: 'saved-1',
            label: 'Theo serial',
            filters: savedFilters as Record<string, unknown>,
            createdAt: '2026-07-14T00:00:00.000Z',
          },
        ],
      },
    })
    const onChange = vi.fn()
    render(
      <RepairFilters
        filters={{}}
        activeFilterCount={0}
        onChange={onChange}
        onClear={vi.fn()}
        onSearch={vi.fn()}
        onReload={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Lưu / Xem bộ lọc' }))
    await user.click(await screen.findByRole('button', { name: 'Theo serial' }))
    expect(onChange).toHaveBeenCalledWith(savedFilters)
  })
})

import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DataTableToolbar } from './data-table-toolbar'

describe('DataTableToolbar search', () => {
  afterEach(() => vi.useRealTimers())

  it('debounces typing and emits an input clear immediately', () => {
    vi.useFakeTimers()
    const onSearchChange = vi.fn()
    render(<DataTableToolbar onSearchChange={onSearchChange} />)
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Minh' } })
    expect(input).toHaveValue('Minh')
    expect(onSearchChange).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(299))
    expect(onSearchChange).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onSearchChange).toHaveBeenCalledWith('Minh')

    fireEvent.change(input, { target: { value: '' } })
    expect(onSearchChange).toHaveBeenLastCalledWith('')
  })

  it('applies a controlled clear immediately and cancels pending text', () => {
    vi.useFakeTimers()
    const onSearchChange = vi.fn()
    const { rerender } = render(
      <DataTableToolbar
        searchValue="Đã áp dụng"
        onSearchChange={onSearchChange}
      />,
    )
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Đang gõ' } })
    rerender(
      <DataTableToolbar searchValue="" onSearchChange={onSearchChange} />,
    )

    expect(input).toHaveValue('')
    act(() => vi.advanceTimersByTime(300))
    expect(onSearchChange).not.toHaveBeenCalled()
  })

  it('shows an explicit clear control that cancels pending search text', () => {
    vi.useFakeTimers()
    const onSearchChange = vi.fn()
    render(<DataTableToolbar onSearchChange={onSearchChange} />)
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Đang nhập' } })
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tìm kiếm' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(onSearchChange).toHaveBeenCalledTimes(1)
    expect(onSearchChange).toHaveBeenCalledWith('')
    act(() => vi.advanceTimersByTime(300))
    expect(onSearchChange).toHaveBeenCalledTimes(1)
  })
})

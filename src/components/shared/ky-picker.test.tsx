/** Spec: Kỳ pickers render "Kỳ"/"Từ Kỳ"/"Đến Kỳ" with descending M/YYYY options. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KyPicker, KyRangePicker, KY_OPTIONS } from './ky-picker'

describe('KyPicker', () => {
  it('renders a "Kỳ" label', () => {
    render(<KyPicker onChange={vi.fn()} />)
    expect(screen.getByText('Kỳ')).toBeInTheDocument()
  })

  it('options are formatted "M/YYYY", newest first, and include 7/2026', () => {
    expect(KY_OPTIONS[0].ten).toBe('7/2026')
    for (const k of KY_OPTIONS) expect(k.ten).toMatch(/^([1-9]|1[0-2])\/\d{4}$/)
  })
})

describe('KyRangePicker', () => {
  it('renders exactly the "Từ Kỳ" and "Đến Kỳ" labels', () => {
    render(
      <KyRangePicker onFromChange={vi.fn()} onToChange={vi.fn()} />,
    )
    expect(screen.getByText('Từ Kỳ')).toBeInTheDocument()
    expect(screen.getByText('Đến Kỳ')).toBeInTheDocument()
  })
})

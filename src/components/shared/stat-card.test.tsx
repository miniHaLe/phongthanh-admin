import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('marks negative values as destructive and provides a compact mobile value', () => {
    renderWithProviders(<StatCard label="Tổng tiền" value="-2.993.590.000 ₫" />)

    const card = screen.getByText('Tổng tiền').closest('[data-negative]')
    expect(card).toHaveAttribute('data-negative')
    expect(card).toHaveClass('bg-destructive/5')
    expect(screen.getByText('Giá trị âm')).toBeInTheDocument()

    const value = screen.getByLabelText('-2.993.590.000 ₫')
    expect(value).toHaveClass('whitespace-nowrap', 'tabular-nums')
    expect(value.querySelector('.sm\\:hidden')).toHaveTextContent(/tỷ.*₫/i)
  })

  it('keeps positive values neutral', () => {
    renderWithProviders(<StatCard label="Tổng tồn" value="1.234" />)

    expect(screen.getByText('Tổng tồn').closest('[data-negative]')).toBeNull()
    expect(screen.queryByText('Giá trị âm')).not.toBeInTheDocument()
  })
})

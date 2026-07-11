import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from './table-cell-content'

describe('table cell content', () => {
  it('marks protected values without clipping and supports tabular numbers', () => {
    render(<TableProtectedValue tabular>PT-2026-000123</TableProtectedValue>)

    const value = screen.getByText('PT-2026-000123')
    expect(value).toHaveAttribute('data-table-protected', 'true')
    expect(value).toHaveClass(
      'whitespace-nowrap',
      'overflow-visible',
      'tabular-nums',
    )
    expect(value).not.toHaveClass('truncate', 'overflow-hidden')
  })

  it('clamps descriptions to two lines and exposes their complete value', () => {
    render(<TableDescription value="Mô tả đầy đủ của lỗi thiết bị" />)

    const description = screen.getByText('Mô tả đầy đủ của lỗi thiết bị')
    expect(description).toHaveClass('line-clamp-2')
    expect(description).toHaveAttribute(
      'title',
      'Mô tả đầy đủ của lỗi thiết bị',
    )
    expect(description).toHaveAccessibleName('Mô tả đầy đủ của lỗi thiết bị')
  })

  it('uses intrinsic label and protected-value-safe grid tracks', () => {
    render(
      <TableMetaStack data-testid="meta-stack">
        <span>Mã:</span>
        <span>LK-001</span>
      </TableMetaStack>,
    )

    expect(screen.getByTestId('meta-stack')).toHaveClass(
      'grid-cols-[max-content_minmax(min-content,1fr)]',
    )
  })
})

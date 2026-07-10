import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './input'

describe('Input mobile sizing contract', () => {
  it('uses 16px mobile text and a 44px mobile height by default', () => {
    render(<Input aria-label="Search" />)
    expect(screen.getByLabelText('Search')).toHaveClass(
      'h-11',
      'text-base',
      'md:h-9',
      'md:text-sm',
    )
  })
})

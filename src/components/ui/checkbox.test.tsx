import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Checkbox } from './checkbox'

describe('Checkbox mobile sizing contract', () => {
  it('exposes a larger mobile box with compact desktop override', () => {
    render(<Checkbox aria-label="Select row" />)
    expect(screen.getByRole('checkbox', { name: 'Select row' })).toHaveClass(
      'h-11',
      'w-11',
      'md:h-4',
      'md:w-4',
    )
  })
})

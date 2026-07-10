import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button mobile sizing contract', () => {
  it('keeps mobile-safe default and icon targets with desktop density overrides', () => {
    render(
      <>
        <Button>Default</Button>
        <Button size="sm">Small</Button>
        <Button size="icon" aria-label="Icon action" />
      </>,
    )

    expect(screen.getByRole('button', { name: 'Default' })).toHaveClass(
      'h-11',
      'md:h-9',
    )
    expect(screen.getByRole('button', { name: 'Small' })).toHaveClass(
      'h-11',
      'md:h-8',
    )
    expect(screen.getByRole('button', { name: 'Icon action' })).toHaveClass(
      'h-11',
      'w-11',
      'md:h-9',
      'md:w-9',
    )
  })
})

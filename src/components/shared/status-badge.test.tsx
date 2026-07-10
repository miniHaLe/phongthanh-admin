/** Render test: StatusBadge shows the canonical label for a given status id. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './status-badge'
import { STATUS_LABEL } from '@/domains/repair/status'

describe('StatusBadge', () => {
  it('renders the canonical label text for the status id', () => {
    render(<StatusBadge status={7} />)
    expect(screen.getByText(STATUS_LABEL[7])).toBeInTheDocument()
  })
})

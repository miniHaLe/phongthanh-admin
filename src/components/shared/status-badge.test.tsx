/** Render test: StatusBadge shows the canonical label for a given status id. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './status-badge'
import {
  REPAIR_STATUS_IDS,
  STATUS_HEX,
  STATUS_LABEL,
} from '@/domains/repair/status'

describe('StatusBadge', () => {
  it('renders the canonical label text for the status id', () => {
    render(<StatusBadge status={7} />)
    expect(screen.getByText(STATUS_LABEL[7])).toBeInTheDocument()
  })

  it('preserves the full-cell legacy table anatomy', () => {
    const { container } = render(<StatusBadge status={7} variant="table" />)
    const badge = container.querySelector('[data-status-variant="table"]')

    expect(badge).toHaveStyle({ backgroundColor: STATUS_HEX[7] })
    expect(badge).toHaveClass(
      'flex',
      'min-h-11',
      'items-center',
      'justify-center',
    )
    expect(screen.getByText(STATUS_LABEL[7])).toHaveClass(
      'bg-background/90',
      'font-bold',
      'uppercase',
      'text-foreground',
    )
    expect(screen.getByText(STATUS_LABEL[7])).not.toHaveClass(
      'bg-white/90',
      'text-black',
    )
  })

  it('maps every canonical status to its fixed legacy hex', () => {
    const { container } = render(
      <>
        {REPAIR_STATUS_IDS.map((id) => (
          <StatusBadge key={id} status={id} variant="solid" />
        ))}
      </>,
    )

    expect(REPAIR_STATUS_IDS).toHaveLength(15)
    for (const id of REPAIR_STATUS_IDS) {
      expect(container.querySelector(`[data-status-id="${id}"]`)).toHaveStyle({
        backgroundColor: STATUS_HEX[id],
      })
    }
  })
})

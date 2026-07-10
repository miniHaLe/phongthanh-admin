/** Spec: PlanCalendar renders a month grid with ≥1 seeded event chip. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlanCalendar } from './PlanCalendar'
import { PLAN_EVENTS } from '@/mock/plan-events-mock'

describe('PlanCalendar', () => {
  it('renders the weekday header and month nav', () => {
    render(<PlanCalendar initial={{ year: 2026, month: 6 }} />)
    expect(screen.getByText('T2')).toBeInTheDocument()
    expect(screen.getByText('CN')).toBeInTheDocument()
    expect(screen.getByText('Tháng 7/2026')).toBeInTheDocument()
    expect(screen.getByLabelText('Tháng trước')).toBeInTheDocument()
    expect(screen.getByLabelText('Tháng sau')).toBeInTheDocument()
  })

  it('renders at least one seeded event chip in a 31-day month', () => {
    render(<PlanCalendar initial={{ year: 2026, month: 6 }} />)
    // July has 31 days so every seeded day (1-28) is present.
    const title = PLAN_EVENTS[0].title
    expect(screen.getAllByTitle(title).length).toBeGreaterThan(0)
  })
})

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LookupLabel } from './lookup-label'
import { useLookup } from '@/hooks/use-lookup'
import type { ChiNhanh } from '@/types/masterdata-types'

vi.mock('@/hooks/use-lookup', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/use-lookup')>()),
  useLookup: vi.fn(),
}))

const mockedUseLookup = vi.mocked(useLookup)

const BRANCH = { id: 'cn-1', tenChiNhanh: 'Đắk Lắk' } as ChiNhanh

function stubLookup(state: {
  rows?: ChiNhanh[]
  isPending?: boolean
}): void {
  const rows = state.rows ?? []
  mockedUseLookup.mockReturnValue({
    byId: new Map(rows.map((row) => [row.id, row])),
    rows,
    isPending: state.isPending ?? false,
  } as unknown as ReturnType<typeof useLookup>)
}

function renderLabel(id?: string, fallback?: string) {
  return render(
    <div data-testid="cell">
      <LookupLabel
        resource="chi-nhanh"
        id={id}
        getLabel={(row) => (row as ChiNhanh).tenChiNhanh}
        {...(fallback !== undefined ? { fallback } : {})}
      />
    </div>,
  )
}

beforeEach(() => mockedUseLookup.mockReset())

describe('LookupLabel fallback hardening', () => {
  it('renders the resolved label when the id is in the cache', () => {
    stubLookup({ rows: [BRANCH] })
    renderLabel('cn-1')
    expect(screen.getByTestId('cell')).toHaveTextContent('Đắk Lắk')
  })

  it('renders empty (never the raw id) while the lookup is loading', () => {
    stubLookup({ isPending: true })
    renderLabel('cn-1')
    expect(screen.getByTestId('cell')).toHaveTextContent('')
    expect(screen.queryByText('cn-1')).not.toBeInTheDocument()
  })

  it('renders an em-dash with the id tooltip when missing after load', () => {
    stubLookup({ rows: [] })
    renderLabel('cn-9')
    const cell = screen.getByTestId('cell')
    expect(cell).toHaveTextContent('—')
    expect(cell.querySelector('span')).toHaveAttribute('title', 'cn-9')
    expect(screen.queryByText('cn-9')).not.toBeInTheDocument()
  })

  it('treats a settled query error the same as missing (em-dash + tooltip)', () => {
    // An errored query is settled: isPending false, empty cache.
    stubLookup({ rows: [], isPending: false })
    renderLabel('cn-1')
    const cell = screen.getByTestId('cell')
    expect(cell).toHaveTextContent('—')
    expect(cell.querySelector('span')).toHaveAttribute('title', 'cn-1')
  })

  it('prefers an explicit caller fallback over the em-dash', () => {
    stubLookup({ rows: [] })
    renderLabel('cn-9', 'Không rõ')
    expect(screen.getByTestId('cell')).toHaveTextContent('Không rõ')
    expect(screen.getByText('Không rõ')).toHaveAttribute('title', 'cn-9')
  })

  it('renders empty when no id is provided', () => {
    stubLookup({ rows: [BRANCH] })
    renderLabel(undefined)
    expect(screen.getByTestId('cell')).toHaveTextContent('')
  })
})

import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { KpiResultsTable } from './KpiResultsTable'

const row = {
  personId: 'person-1',
  personName: 'Nguyễn Văn A',
  day1: 1,
  day2: 2,
  day3: 3,
  day4: 4,
  day5: 5,
  day6: 6,
  day7: 7,
  over7: 8,
  total: 36,
}

describe('KpiResultsTable', () => {
  it.each(['Kỹ thuật', 'Tiếp tân'] as const)(
    'renders the exact legacy %s pivot headers',
    (personLabel) => {
      renderWithProviders(
        <KpiResultsTable data={[row]} personLabel={personLabel} />,
      )
      expect(
        screen.getAllByRole('columnheader').map((header) => header.textContent),
      ).toEqual([
        'STT',
        personLabel,
        '1 ngày',
        '2 ngày',
        '3 ngày',
        '4 ngày',
        '5 ngày',
        '6 ngày',
        '7 ngày',
        '>7 ngày',
        'Tổng',
      ])
    },
  )
})

/**
 * Spec: the Xem Tồn Kho family's exact verified column headers (in order),
 * the KPI trio labels + tone-driven negative rendering (no clamp), and the
 * technician-axis dimension on the Kỹ Thuật view.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import XemTonKhoPage from '@/pages/quan-ly-kho/XemTonKhoPage'
import TonKhoLKXacPage from '@/pages/quan-ly-kho/TonKhoLKXacPage'
import TonKhoKyThuatPage from '@/pages/quan-ly-kho/TonKhoKyThuatPage'

const W2_HEADERS = [
  'STT',
  '##',
  'Chi nhánh',
  'Mã hàng',
  'Tên hàng',
  'Nhóm hàng',
  'Model',
  'Giá vốn đầu kỳ',
  'Tồn đầu kỳ',
  'Nhập trong kỳ',
  'Xuất trong kỳ',
  'Tồn',
  'Giá vốn trong kỳ',
  'Tồn cuối kỳ',
  'Tổng tiền',
  'Nhà sản xuất',
  'Nhà kho',
  'Ngăn chứa',
  'Kỳ',
  'Có serial',
]

const W3_HEADERS = W2_HEADERS.filter((h) => h !== 'Tổng tiền')

const W4_HEADERS = [
  'STT',
  '##',
  'Chi nhánh',
  'Kỳ',
  'Kỹ thuật',
  'Mã hàng',
  'Tên hàng',
  'Nhóm hàng',
  'Nhà sản xuất',
  'Model',
  'Tồn đầu kỳ',
  'Nhập trong kỳ',
  'Xuất trong kỳ',
  'Tồn',
  'Giá vốn trong kỳ',
  'Tồn cuối kỳ',
]

async function getTableHeaders(): Promise<string[]> {
  const table = await screen.findByRole('table')
  const headers = within(table).getAllByRole('columnheader')
  return headers.map((h) => h.textContent ?? '')
}

/** KPI labels repeat as column headers too (e.g. "Tồn đầu kỳ") — this asserts
 * the label renders in a StatCard (a <p>, not a <th>). */
function expectKpiLabel(label: string) {
  const matches = screen.getAllByText(label)
  expect(matches.some((el) => el.tagName === 'P')).toBe(true)
}

function queryKpiLabel(label: string): boolean {
  return screen
    .queryAllByText(label)
    .some((el) => el.tagName === 'P')
}

describe('XemTonKhoPage (W2)', () => {
  it('renders the exact 20-column header set in order', async () => {
    renderWithProviders(<XemTonKhoPage />)
    expect(await getTableHeaders()).toEqual(W2_HEADERS)
  })

  it('renders the KPI trio with Tổng tiền shown', async () => {
    renderWithProviders(<XemTonKhoPage />)
    await waitFor(() => {
      expectKpiLabel('Tồn đầu kỳ')
    })
    expectKpiLabel('Tổng tiền')
    expectKpiLabel('Tổng tồn')
  })

  it('renders a negative Tổng tồn KPI with a minus sign (no clamp)', async () => {
    renderWithProviders(<XemTonKhoPage />)
    await waitFor(() => expectKpiLabel('Tổng tồn'))
    await waitFor(() => {
      const kpiLabel = screen
        .getAllByText('Tổng tồn')
        .find((el) => el.tagName === 'P') as HTMLElement
      const card = kpiLabel.closest('div')?.parentElement as HTMLElement
      expect(within(card).getByText(/^-/)).toBeInTheDocument()
    })
  })
})

describe('TonKhoLKXacPage (W3)', () => {
  it('renders the exact 19-column header set (W2 minus Tổng tiền)', async () => {
    renderWithProviders(<TonKhoLKXacPage />)
    expect(await getTableHeaders()).toEqual(W3_HEADERS)
  })

  it('hides the Tổng tiền KPI box but keeps Tồn đầu kỳ + Tổng tồn', async () => {
    renderWithProviders(<TonKhoLKXacPage />)
    await waitFor(() => {
      expectKpiLabel('Tồn đầu kỳ')
    })
    expect(queryKpiLabel('Tổng tiền')).toBe(false)
    expectKpiLabel('Tổng tồn')
  })

  it('renders the title fixing the "xác nhận" misnomer', async () => {
    renderWithProviders(<TonKhoLKXacPage />)
    await waitFor(() => {
      expect(
        screen.getAllByText('Xem Tồn Kho Linh Kiện Xác').length,
      ).toBeGreaterThan(0)
    })
  })
})

describe('TonKhoKyThuatPage (W4)', () => {
  it('renders the exact 16-column header set incl. Kỹ thuật', async () => {
    renderWithProviders(<TonKhoKyThuatPage />)
    expect(await getTableHeaders()).toEqual(W4_HEADERS)
  })

  it('renders the KPI trio', async () => {
    renderWithProviders(<TonKhoKyThuatPage />)
    await waitFor(() => {
      expectKpiLabel('Tồn đầu kỳ')
    })
    expectKpiLabel('Tổng tiền')
    expectKpiLabel('Tổng tồn')
  })

  it('rows carry a non-empty Kỹ thuật value', async () => {
    renderWithProviders(<TonKhoKyThuatPage />)
    const table = await screen.findByRole('table')
    await waitFor(() => {
      expect(within(table).getAllByText(/^KTV /).length).toBeGreaterThan(0)
    })
  })
})

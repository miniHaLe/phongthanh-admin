/**
 * Spec: the Xem Tồn Kho family's grouped composition, KPI behavior, and the
 * unchanged technician-axis view.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { StatCard } from '@/components/shared/stat-card'
import XemTonKhoPage from '@/pages/quan-ly-kho/XemTonKhoPage'
import TonKhoLKXacPage from '@/pages/quan-ly-kho/TonKhoLKXacPage'
import TonKhoKyThuatPage from '@/pages/quan-ly-kho/TonKhoKyThuatPage'

const W2_HEADERS = [
  'STT / Thao tác',
  'Vị trí',
  'Thông tin hàng',
  'Đầu kỳ',
  'Phát sinh',
  'Cuối kỳ',
  'Kỳ',
]

const W3_HEADERS = W2_HEADERS

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
  return screen.queryAllByText(label).some((el) => el.tagName === 'P')
}

describe('XemTonKhoPage (W2)', () => {
  it('renders the grouped stock header set in order', async () => {
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

  it('renders an explicit negative Tổng tồn KPI without clamping it', () => {
    renderWithProviders(<StatCard label="Tổng tồn" value="-2.572" />)

    const card = screen.getByText('Tổng tồn').closest('[data-negative]')
    expect(card).toHaveAttribute('data-negative')
    expect(screen.getByLabelText('-2.572')).toHaveTextContent('-2.572')
  })

  it('keeps the shared filter panel expanded and resets changed filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<XemTonKhoPage />)

    const toggle = screen.getByRole('button', { name: 'Bộ lọc' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const clearButton = screen.getByRole('button', { name: 'Xóa bộ lọc' })
    expect(clearButton).toBeDisabled()

    const productInput = screen.getByLabelText('Mã/tên hàng hóa')
    await user.type(productInput, 'pin')
    expect(clearButton).toBeEnabled()

    await user.click(clearButton)
    expect(productInput).toHaveValue('')
    expect(clearButton).toBeDisabled()
  })
})

describe('TonKhoLKXacPage (W3)', () => {
  it('renders the grouped confirmed-stock header set', async () => {
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

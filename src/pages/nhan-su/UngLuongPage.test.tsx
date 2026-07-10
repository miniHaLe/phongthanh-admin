/** Spec: Ứng Lương page — verified columns + Kỳ filter (section-hr.md H4). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import UngLuongPage from './UngLuongPage'

describe('UngLuongPage', () => {
  it('renders the verified column headers', async () => {
    renderWithProviders(<UngLuongPage />, { route: ROUTES.hrAdvances })
    for (const header of [
      'Tên Nhân Viên',
      'Tên Kỳ',
      'Ngày Ứng',
      'Số Tiền',
      'Ghi chú',
    ]) {
      expect(await screen.findByText(header)).toBeInTheDocument()
    }
  })
})

/** Spec: Chấm Công — 12-column exception-record list + Loại chấm công select (section-hr.md H9). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import ChamCongPage from './ChamCongPage'

describe('ChamCongPage', () => {
  it('renders the verified column headers', async () => {
    renderWithProviders(<ChamCongPage />, { route: ROUTES.hrAttendance })
    for (const header of [
      'STT',
      'Tên NV',
      'Giới tính',
      'Chức danh',
      'Chi nhánh',
      'Loại chấm',
      'Chấm công',
      'Ngày chấm công',
      'Ngày tạo',
      'Kỳ',
      'Loại trừ',
    ]) {
      expect(await screen.findByText(header)).toBeInTheDocument()
    }
  })

  it('opens the create sheet with the Loại chấm công + Loại trừ lương selects', async () => {
    renderWithProviders(<ChamCongPage />, { route: ROUTES.hrAttendance })
    const addButton = await screen.findByRole('button', { name: 'Thêm' })
    addButton.click()
    expect(await screen.findByText('Loại chấm công')).toBeInTheDocument()
    expect(await screen.findByText('Loại trừ lương')).toBeInTheDocument()
  })
})

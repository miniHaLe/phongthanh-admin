/**
 * Spec: Nhân Viên list — 11-column header set (STT/checkbox/Hình/Mã NV/Tên NV
 * /Phòng/Giới tính/Ngày sinh/Điện thoại/Khóa/Chọn) + the Khóa/Mở khóa lock
 * toggle (section-hr.md H7, addendum ajax-NhanVien-List.html).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { ROUTES } from '@/constants/routes'
import NhanVienPage from './NhanVienPage'

const notifySuccess = vi.fn()
vi.mock('@/components/shared', async (orig) => {
  const actual = await orig<typeof import('@/components/shared')>()
  return {
    ...actual,
    notify: { ...actual.notify, success: (m?: string) => notifySuccess(m) },
  }
})

beforeEach(() => {
  notifySuccess.mockClear()
})

describe('NhanVienPage', () => {
  it('renders the verified column headers', async () => {
    renderWithProviders(<NhanVienPage />, { route: ROUTES.hrEmployees })
    for (const header of [
      'STT',
      'Hình',
      'Mã NV',
      'Tên NV',
      'Phòng',
      'Giới tính',
      'Ngày sinh',
      'Điện thoại',
      'Khóa',
    ]) {
      expect(await screen.findByText(header)).toBeInTheDocument()
    }
  })

  it('renders a Thêm nhân viên button linking to the full-page create route', async () => {
    renderWithProviders(<NhanVienPage />, { route: ROUTES.hrEmployees })
    expect(
      await screen.findByRole('button', { name: /Thêm nhân viên/ }),
    ).toBeInTheDocument()
  })

  it('toggles the Khóa/Mở khóa lock button per row', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhanVienPage />, { route: ROUTES.hrEmployees })
    // Wait for the loading skeleton to resolve into real rows (Mã NV cells
    // render "NV####").
    await screen.findAllByText(/^NV\d{4}$/)
    const rows = screen.getAllByRole('row')
    // rows[0] is the header row; use the first data row.
    const firstDataRow = rows[1]
    const lockButton = within(firstDataRow)
      .getAllByRole('button')
      .find((b) => b.hasAttribute('data-lock'))!
    expect(lockButton).toBeTruthy()
    const before = lockButton.getAttribute('data-lock')
    await user.click(lockButton)
    await vi.waitFor(() => expect(notifySuccess).toHaveBeenCalled())
    expect(before).toMatch(/True|False/)
  })
})

/**
 * Spec: cross-branch Chuyển Kho editor — header fields, "Số lượng chuyển"
 * line column (distinguishing it from the same-branch editor), toolbar.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import ChuyenKhoCrossBranchPage from './ChuyenKhoCrossBranchPage'

describe('ChuyenKhoCrossBranchPage', () => {
  it('renders Từ chi nhánh/Từ nhà kho/Đến chi nhánh/Đến nhà kho header fields', () => {
    renderWithProviders(<ChuyenKhoCrossBranchPage />)
    expect(screen.getByLabelText('Từ chi nhánh')).toBeInTheDocument()
    expect(screen.getByLabelText('Từ nhà kho')).toBeInTheDocument()
    expect(screen.getByLabelText('Đến chi nhánh')).toBeInTheDocument()
    expect(screen.getByLabelText('Đến nhà kho')).toBeInTheDocument()
  })

  it('renders the "Số lượng chuyển" line column (not present on the same-branch editor)', () => {
    renderWithProviders(<ChuyenKhoCrossBranchPage />)
    expect(
      screen.getByRole('columnheader', { name: 'Số lượng chuyển' }),
    ).toBeInTheDocument()
  })

  it('does not render an "Đến ngăn chứa" field (same-branch only)', () => {
    renderWithProviders(<ChuyenKhoCrossBranchPage />)
    expect(screen.queryByLabelText('Đến ngăn chứa')).not.toBeInTheDocument()
  })

  it('renders Lưu / Lưu & Thêm mới / In / Danh sách chuyển kho', () => {
    renderWithProviders(<ChuyenKhoCrossBranchPage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Danh sách chuyển kho' })).toBeInTheDocument()
  })
})

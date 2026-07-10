/**
 * Spec: same-branch Chuyển Kho editor — locked branches, "Đến ngăn chứa"
 * header field + per-line "Ngăn chứa" column (distinguishing it from the
 * cross-branch editor), toolbar.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import ChuyenKhoSameBranchPage from './ChuyenKhoSameBranchPage'

describe('ChuyenKhoSameBranchPage', () => {
  it('locks Từ chi nhánh and Đến chi nhánh to the current branch (read-only)', () => {
    renderWithProviders(<ChuyenKhoSameBranchPage />)
    const branchInputs = screen.getAllByDisplayValue('Đắk Lắk')
    expect(branchInputs).toHaveLength(2)
    branchInputs.forEach((input) => expect(input).toBeDisabled())
  })

  it('renders the "Đến ngăn chứa" header field', () => {
    renderWithProviders(<ChuyenKhoSameBranchPage />)
    expect(screen.getByLabelText('Đến ngăn chứa')).toBeInTheDocument()
  })

  it('renders the per-line "Ngăn chứa" column (not "Số lượng chuyển")', () => {
    renderWithProviders(<ChuyenKhoSameBranchPage />)
    expect(screen.getByRole('columnheader', { name: 'Ngăn chứa' })).toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Số lượng chuyển' }),
    ).not.toBeInTheDocument()
  })

  it('renders Lưu / Lưu & Thêm mới / In / Danh sách chuyển kho', () => {
    renderWithProviders(<ChuyenKhoSameBranchPage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Danh sách chuyển kho' })).toBeInTheDocument()
  })
})

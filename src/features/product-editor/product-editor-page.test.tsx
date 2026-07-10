/**
 * Spec: the Hàng Hóa full-page editor (C5b) renders the 3 verified price-tier
 * labels and the core required fields, matching the reference editor.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import ProductEditorPage from './product-editor-page'

describe('ProductEditorPage', () => {
  it('renders the 3 verified price-tier labels', () => {
    renderWithProviders(<ProductEditorPage />)
    expect(screen.getByText('Giá mua')).toBeInTheDocument()
    expect(screen.getByText('Giá bán sỉ')).toBeInTheDocument()
    expect(screen.getByText('Giá bán lẻ')).toBeInTheDocument()
  })

  it('renders the Dùng chung nhiều model toggle and core required fields', () => {
    renderWithProviders(<ProductEditorPage />)
    expect(screen.getByText('Dùng chung nhiều model')).toBeInTheDocument()
    expect(screen.getByText('Có Serial')).toBeInTheDocument()
    expect(screen.getByText('Phát sinh tự động')).toBeInTheDocument()
  })

  it('renders the Lưu / Lưu & Thêm mới / Danh sách hàng hóa toolbar', () => {
    renderWithProviders(<ProductEditorPage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Danh sách hàng hóa' }),
    ).toBeInTheDocument()
  })
})

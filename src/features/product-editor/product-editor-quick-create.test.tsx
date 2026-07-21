/**
 * Phase 3: product editor reuses the shared 4-field Model quick-create dialog
 * (Tên Sản Phẩm + Nhà sản xuất + Tên model + Ghi chú), prefilling NSX from the
 * form and saving with the chosen sanPhamId (no first-row fallback). The NSX
 * quick-create dialog carries Đường dẫn hãng with URL validation.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import type { ModelCatalog } from '@/features/model/model-catalog-data'

const mocks = vi.hoisted(() => ({
  loadModelCatalog: vi.fn(),
  createCatalogModel: vi.fn(),
}))

vi.mock('@/features/model/model-catalog-data', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/model/model-catalog-data')>()
  return {
    ...actual,
    loadModelCatalog: mocks.loadModelCatalog,
    createCatalogModel: mocks.createCatalogModel,
  }
})

function buildCatalog(): ModelCatalog {
  const base = { active: true, createdAt: '2026-01-01' }
  return {
    manufacturers: [{ id: 'nsx-1', tenNSX: 'Samsung', ...base }],
    products: [
      { id: 'sp-tl', tenSP: 'Tủ lạnh', nhomSanPhamId: 'g', ...base },
      { id: 'sp-tv', tenSP: 'Tivi', nhomSanPhamId: 'g', ...base },
    ],
    models: [],
  }
}

beforeEach(() => {
  mocks.loadModelCatalog.mockResolvedValue(buildCatalog())
  mocks.createCatalogModel.mockReset()
})

describe('product editor + Model quick-create parity', () => {
  it('opens the 4-field Model dialog with NSX prefilled from the form', async () => {
    const { default: ProductEditorPage } = await import('./product-editor-page')
    const user = userEvent.setup()
    renderWithProviders(<ProductEditorPage />)

    // Choose an NSX in the form first.
    const nsxInput = screen.getByPlaceholderText('Tên nhà sản xuất')
    await user.click(nsxInput)
    await user.type(nsxInput, 'Samsung')
    await user.click(await screen.findByRole('option', { name: /^Samsung$/ }))

    // Open the Model quick-create dialog.
    await user.click(screen.getByRole('button', { name: 'Thêm mới model' }))
    const dialog = within(await screen.findByRole('dialog'))

    expect(dialog.getByText(/Tên Sản Phẩm/)).toBeInTheDocument()
    expect(dialog.getByLabelText(/Tên model/)).toBeInTheDocument()
    expect(dialog.getByLabelText('Ghi chú')).toBeInTheDocument()
    // NSX select prefilled from the form's Samsung selection.
    expect(dialog.getByText('Samsung')).toBeInTheDocument()
  })

  it('saves the model with the chosen sanPhamId, not the first row', async () => {
    const { default: ProductEditorPage } = await import('./product-editor-page')
    const user = userEvent.setup()
    mocks.createCatalogModel.mockResolvedValueOnce({
      id: 'mod-new',
      tenModel: 'Series X',
      nhaSanXuatId: 'nsx-1',
      sanPhamId: 'sp-tv',
      active: true,
      createdAt: '2026-07-11',
    })
    renderWithProviders(<ProductEditorPage />)

    await user.click(screen.getByRole('button', { name: 'Thêm mới model' }))
    const dialog = within(await screen.findByRole('dialog'))
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: 'Lưu' })).toBeEnabled(),
    )

    // Pick the SECOND product (Tivi) so a first-row fallback would be wrong.
    await user.click(dialog.getByLabelText(/Tên Sản Phẩm/))
    await user.click(await screen.findByRole('option', { name: 'Tivi' }))
    await user.click(dialog.getByLabelText(/Nhà sản xuất/))
    await user.click(await screen.findByRole('option', { name: 'Samsung' }))
    await user.type(dialog.getByLabelText(/Tên model/), 'Series X')
    await user.click(dialog.getByRole('button', { name: 'Lưu' }))

    await waitFor(() =>
      expect(mocks.createCatalogModel).toHaveBeenCalledWith(
        expect.objectContaining({ sanPhamId: 'sp-tv', nhaSanXuatId: 'nsx-1' }),
      ),
    )
  })
})

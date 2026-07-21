/**
 * Phase 2 behavior: the product-editor Model autocomplete filters by the
 * selected Nhà sản xuất, renders table-style rows (Sản phẩm + NSX + Tên model),
 * back-fills NSX when a model is picked with NSX empty, and clears an
 * incompatible model when NSX changes.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { NHA_SAN_XUAT_ROWS } from '@/mock/masterdata/nha-san-xuat.mock'
import type { ModelCatalog } from '@/features/model/model-catalog-data'
import ProductEditorPage from './product-editor-page'

const TOSHIBA = NHA_SAN_XUAT_ROWS.find((r) => r.tenNSX === 'Toshiba')!
const SAMSUNG = NHA_SAN_XUAT_ROWS.find((r) => r.tenNSX === 'Samsung')!

const mocks = vi.hoisted(() => ({ loadModelCatalog: vi.fn() }))

vi.mock('@/features/model/model-catalog-data', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/model/model-catalog-data')>()
  return { ...actual, loadModelCatalog: mocks.loadModelCatalog }
})

function buildCatalog(): ModelCatalog {
  const base = { active: true, createdAt: '2026-01-01' }
  return {
    manufacturers: [
      { id: TOSHIBA.id, tenNSX: 'Toshiba', ...base },
      { id: SAMSUNG.id, tenNSX: 'Samsung', ...base },
    ],
    products: [
      { id: 'sp-tl', tenSP: 'Tủ lạnh', nhomSanPhamId: 'g', ...base },
      { id: 'sp-tv', tenSP: 'Tivi', nhomSanPhamId: 'g', ...base },
    ],
    models: [
      {
        id: 'm-tos-1',
        tenModel: 'Toshiba Fridge A',
        maModel: 'MOD1',
        nhaSanXuatId: TOSHIBA.id,
        sanPhamId: 'sp-tl',
        ...base,
      },
      {
        id: 'm-tos-2',
        tenModel: 'Toshiba TV B',
        maModel: 'MOD2',
        nhaSanXuatId: TOSHIBA.id,
        sanPhamId: 'sp-tv',
        ...base,
      },
      {
        id: 'm-sam-1',
        tenModel: 'Samsung Fridge C',
        maModel: 'MOD3',
        nhaSanXuatId: SAMSUNG.id,
        sanPhamId: 'sp-tl',
        ...base,
      },
      {
        id: 'm-sam-2',
        tenModel: 'Samsung TV D',
        maModel: 'MOD4',
        nhaSanXuatId: SAMSUNG.id,
        sanPhamId: 'sp-tv',
        ...base,
      },
    ],
  }
}

async function selectAutocomplete(
  user: ReturnType<typeof userEvent.setup>,
  placeholder: string,
  query: string,
  optionName: RegExp,
) {
  const input = screen.getByPlaceholderText(placeholder)
  await user.click(input)
  await user.type(input, query)
  const option = await screen.findByRole('option', { name: optionName })
  await user.click(option)
}

beforeEach(() => {
  mocks.loadModelCatalog.mockResolvedValue(buildCatalog())
})

describe('ProductEditorPage — Model filtered by NSX', () => {
  it('shows only the selected brand models when NSX is chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductEditorPage />)

    await selectAutocomplete(user, 'Tên nhà sản xuất', 'Toshiba', /^Toshiba$/)

    await user.click(screen.getByPlaceholderText('Tên model'))
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(2)
    options.forEach((option) => expect(option).toHaveTextContent('Toshiba'))
    expect(screen.queryByText('Samsung Fridge C')).not.toBeInTheDocument()
  })

  it('lists all models with Sản phẩm + NSX columns when NSX is empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductEditorPage />)

    await user.click(screen.getByPlaceholderText('Tên model'))
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(4)

    const toshibaFridge = options.find((o) =>
      o.textContent?.includes('Toshiba Fridge A'),
    )
    expect(toshibaFridge).toHaveTextContent('Tủ lạnh')
    expect(toshibaFridge).toHaveTextContent('Toshiba')
  })

  it('back-fills NSX from the model when picked with NSX empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductEditorPage />)

    await user.click(screen.getByPlaceholderText('Tên model'))
    await user.click(await screen.findByRole('option', { name: /Toshiba Fridge A/ }))

    expect(screen.getByPlaceholderText('Tên nhà sản xuất')).toHaveValue('Toshiba')
  })

  it('clears an incompatible model when NSX changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductEditorPage />)

    await selectAutocomplete(user, 'Tên nhà sản xuất', 'Toshiba', /^Toshiba$/)
    await user.click(screen.getByPlaceholderText('Tên model'))
    await user.click(await screen.findByRole('option', { name: /Toshiba Fridge A/ }))
    expect(screen.getByPlaceholderText('Tên model')).toHaveValue('Toshiba Fridge A')

    await selectAutocomplete(user, 'Tên nhà sản xuất', 'Samsung', /^Samsung$/)
    expect(screen.getByPlaceholderText('Tên model')).toHaveValue('')
  })

  it('does not crash the Model filter for an NSX id absent from the catalog', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductEditorPage />)

    // Simulate a freshly quick-created NSX whose id is not yet in the catalog.
    await selectAutocomplete(
      user,
      'Tên nhà sản xuất',
      'Toshiba',
      /^Toshiba$/,
    )
    // Swap the catalog to one missing Toshiba's models entirely, then reopen.
    mocks.loadModelCatalog.mockResolvedValue({
      ...buildCatalog(),
      models: [],
    })

    await user.click(screen.getByPlaceholderText('Tên model'))
    expect(
      await screen.findByText('Không có kết quả'),
    ).toBeInTheDocument()
  })
})

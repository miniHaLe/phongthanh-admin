import { describe, expect, it } from 'vitest'
import { createRepairTicket } from './mock-data'
import {
  isCompatibleModelSelection,
  MODELS,
  registerCatalogRows,
  replaceCatalogRows,
} from './reference-data'

describe('repair model mutation boundary', () => {
  it('rejects a model paired with a different manufacturer', async () => {
    const model = MODELS[0]
    await expect(
      createRepairTicket({
        tenKhach: 'Khách thử',
        sdt: '0900000000',
        branchId: 'dak-lak',
        nhaSanXuatId: 'nsx-khong-dung',
        sanPhamId: model.sanPhamId,
        modelId: model.id,
        hinhThuc: 'sua_dich_vu',
        kyThuatId: '',
        ngayNhan: '2026-07-11',
        moTaLoi: 'Kiểm thử quan hệ model',
        chiPhiDuKien: 0,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_MODEL_RELATION' })
  })

  it('rejects a persisted model after a complete catalog refresh removes it', () => {
    registerCatalogRows(
      [{ id: 'nsx-deleted-model-test', tenNSX: 'Hãng test' }],
      [{ id: 'sp-deleted-model-test', tenSP: 'Sản phẩm test' }],
      [
        {
          id: 'model-deleted-model-test',
          tenModel: 'Model test',
          nhaSanXuatId: 'nsx-deleted-model-test',
          sanPhamId: 'sp-deleted-model-test',
        },
      ],
    )
    expect(
      isCompatibleModelSelection(
        'nsx-deleted-model-test',
        'sp-deleted-model-test',
        'model-deleted-model-test',
      ),
    ).toBe(true)

    replaceCatalogRows([], [], [])

    expect(
      isCompatibleModelSelection(
        'nsx-deleted-model-test',
        'sp-deleted-model-test',
        'model-deleted-model-test',
      ),
    ).toBe(false)
  })
})

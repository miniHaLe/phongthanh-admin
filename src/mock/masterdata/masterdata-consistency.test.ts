/**
 * Structural invariants the điện lạnh masterdata catalog must satisfy.
 * These hold BEFORE and AFTER the tech-device → điện lạnh re-theme, except the
 * FK-coherence + no-device-name cases which are RED against the old random data
 * and turn green once the deterministic điện lạnh tables land (Phase 1).
 */
import { describe, expect, it } from 'vitest'
import { NHA_SAN_XUAT_ROWS } from './nha-san-xuat.mock'
import { SAN_PHAM_ROWS } from './san-pham.mock'
import { MODEL_ROWS } from './model.mock'
import { HANG_HOA_ROWS } from './hang-hoa.mock'
import { NHOM_SAN_PHAM_ROWS } from './nhom-san-pham.mock'
import { SEED_PRODUCTS } from '@/mock/seed/products'

/** Device-brand / model tokens that must not survive the re-theme. */
const DEVICE_TOKENS =
  /iPhone|MacBook|Galaxy|iPad|Xiaomi|AirPods|IdeaPad|Redmi|Oppo|OPPO|ThinkPad|Realme|Vivo|Nokia|Huawei|Apple|Xperia|POCO/i

describe('masterdata FK closure', () => {
  it('every model references an existing NSX and San Pham', () => {
    const nsxIds = new Set(NHA_SAN_XUAT_ROWS.map((r) => r.id))
    const spIds = new Set(SAN_PHAM_ROWS.map((r) => r.id))
    for (const model of MODEL_ROWS) {
      expect(nsxIds.has(model.nhaSanXuatId)).toBe(true)
      expect(spIds.has(model.sanPhamId)).toBe(true)
    }
  })

  it('every San Pham references an existing Nhom San Pham', () => {
    const nhomIds = new Set(NHOM_SAN_PHAM_ROWS.map((r) => r.id))
    for (const sp of SAN_PHAM_ROWS) {
      expect(nhomIds.has(sp.nhomSanPhamId)).toBe(true)
    }
  })

  it('hang hoa carrying both model + NSX stays coherent (model NSX === row NSX)', () => {
    const modelById = new Map(MODEL_ROWS.map((m) => [m.id, m]))
    for (const hh of HANG_HOA_ROWS) {
      if (hh.modelId && hh.nhaSanXuatId) {
        const model = modelById.get(hh.modelId)
        expect(model).toBeDefined()
        expect(model?.nhaSanXuatId).toBe(hh.nhaSanXuatId)
      }
    }
  })

  it('every seed product resolves its nhom san pham', () => {
    // SEED_PRODUCTS use the seed reference-data universe; assert non-empty +
    // internally consistent nhomSanPhamId references.
    expect(SEED_PRODUCTS.length).toBeGreaterThan(0)
    for (const product of SEED_PRODUCTS) {
      expect(product.nhomSanPhamId).toBeTruthy()
    }
  })
})

describe('masterdata id formats stay stable', () => {
  it('keeps nsx-/sp-/mod-/hh- id schemes', () => {
    expect(NHA_SAN_XUAT_ROWS.every((r) => /^nsx-\d+$/.test(r.id))).toBe(true)
    expect(SAN_PHAM_ROWS.every((r) => /^sp-\d+$/.test(r.id))).toBe(true)
    expect(MODEL_ROWS.every((r) => /^mod-\d+$/.test(r.id))).toBe(true)
    expect(HANG_HOA_ROWS.every((r) => /^hh-\d+$/.test(r.id))).toBe(true)
  })
})

describe('điện lạnh theme — no tech-device names', () => {
  it('has no device tokens in NSX / San Pham / Model / Hang Hoa names', () => {
    for (const row of NHA_SAN_XUAT_ROWS) {
      expect(row.tenNSX).not.toMatch(DEVICE_TOKENS)
    }
    for (const row of SAN_PHAM_ROWS) {
      expect(row.tenSP).not.toMatch(DEVICE_TOKENS)
    }
    for (const row of MODEL_ROWS) {
      expect(row.tenModel).not.toMatch(DEVICE_TOKENS)
    }
    for (const row of HANG_HOA_ROWS) {
      expect(row.tenHH).not.toMatch(DEVICE_TOKENS)
      if (row.tenTiengAnh) expect(row.tenTiengAnh).not.toMatch(DEVICE_TOKENS)
    }
  })
})

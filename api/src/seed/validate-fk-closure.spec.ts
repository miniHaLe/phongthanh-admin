import { loadFixtures } from './load-fixtures'
import { validateSeedFixtureClosure } from './validate-fk-closure'

describe('masterdata seed fixture closure', () => {
  it('accepts the committed frozen fixtures and canonical branch ids', () => {
    const fixtures = loadFixtures()

    expect(() => validateSeedFixtureClosure(fixtures)).not.toThrow()
    expect(
      fixtures.loiSuaChua.every((row) => /^cn-[123]$/.test(row.branchId)),
    ).toBe(true)
  })

  it('fails loud for a missing dependent-table reference', () => {
    const fixtures = structuredClone(loadFixtures())
    fixtures.nganChua[0].nhaKhoId = 'nha-kho-khong-ton-tai'

    expect(() => validateSeedFixtureClosure(fixtures)).toThrow(
      /ngan_chua .* references missing nha_kho/,
    )
  })

  it('fails loud for a missing goods lookup reference', () => {
    const fixtures = structuredClone(loadFixtures())
    fixtures.hangHoa[0].donViTinhId = 'dvt-khong-ton-tai'

    expect(() => validateSeedFixtureClosure(fixtures)).toThrow(
      /hang_hoa .* references missing don_vi_tinh/,
    )
  })
})

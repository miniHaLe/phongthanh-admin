import { listParamsQuerySchema } from './list-params.dto'

describe('listParamsQuerySchema', () => {
  it('accepts the legacy 300-row page size', () => {
    expect(
      listParamsQuerySchema.parse({ page: '1', pageSize: '300' }),
    ).toMatchObject({ page: 1, pageSize: 300 })
  })

  it('rejects page sizes above the public limit', () => {
    expect(
      listParamsQuerySchema.safeParse({ page: '1', pageSize: '301' }).success,
    ).toBe(false)
  })
})

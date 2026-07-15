import { isValidElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadConfig(realResources = '') {
  vi.resetModules()
  vi.stubEnv('VITE_REAL_RESOURCES', realResources)
  return (await import('./loi-sua-chua.config')).loiSuaChuaConfig
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('loiSuaChuaConfig', () => {
  it('renders the exact verified labor-price column header order', async () => {
    const loiSuaChuaConfig = await loadConfig()

    expect(loiSuaChuaConfig.columns.map((c) => c.header)).toEqual([
      'Chi Nhánh',
      'Tên Nhóm Sản Phẩm',
      'Tên Lỗi Sửa Chữa',
      'Tiền Công',
      'Tiền Công DV',
    ])
  })

  it('preserves legacy branch labels and option values in mock mode', async () => {
    const loiSuaChuaConfig = await loadConfig()
    const column = loiSuaChuaConfig.columns.find((c) => c.key === 'branchId')
    const field = loiSuaChuaConfig.fields.find((f) => f.key === 'branchId')
    const filter = loiSuaChuaConfig.filters?.find((f) => f.key === 'branchId')

    expect(column?.renderCell?.('dak-lak', {} as never)).toBe('Đắk Lắk')
    expect(field?.options).toEqual([
      { label: 'Đắk Lắk', value: 'dak-lak' },
      { label: 'Đắk Nông', value: 'dak-nong' },
      {
        label: 'Cộng tác viên tuyến huyện',
        value: 'ctv-tuyen-huyen',
      },
    ])
    expect(filter?.options).toEqual(field?.options)
    expect(field?.loadOptions).toBeUndefined()
    expect(filter?.loadOptions).toBeUndefined()
  })

  it('keeps canonical branch lookup behavior in real mode', async () => {
    const loiSuaChuaConfig = await loadConfig('loi-sua-chua')
    const column = loiSuaChuaConfig.columns.find((c) => c.key === 'branchId')
    const field = loiSuaChuaConfig.fields.find((f) => f.key === 'branchId')
    const filter = loiSuaChuaConfig.filters?.find((f) => f.key === 'branchId')
    const rendered = column?.renderCell?.('cn-1', {} as never)

    expect(isValidElement(rendered)).toBe(true)
    if (!isValidElement(rendered)) throw new Error('Expected lookup element')
    expect(rendered.props).toMatchObject({
      resource: 'chi-nhanh',
      id: 'cn-1',
    })
    expect(field?.options).toBeUndefined()
    expect(filter?.options).toBeUndefined()
    expect(field?.loadOptions).toEqual(expect.any(Function))
    expect(filter?.loadOptions).toEqual(expect.any(Function))
    await expect(field?.loadOptions?.()).resolves.toEqual([
      { label: 'Phong Thành Buôn Ma Thuột', value: 'cn-1' },
      { label: 'Phong Thành Gia Nghĩa', value: 'cn-2' },
      { label: 'Cộng tác viên tuyến huyện', value: 'cn-3' },
    ])
  })

  it('opts into bulk-delete and save-and-new', async () => {
    const loiSuaChuaConfig = await loadConfig()

    expect(loiSuaChuaConfig.bulkDelete).toBe(true)
    expect(loiSuaChuaConfig.saveAndNew).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { NAV_DESTINATIONS, NAV_ITEMS } from './nav-config'
import { ROUTES } from '@/constants/routes'
import { MENU_ROWS } from '@/mock/masterdata/menu.mock'

describe('navigation IA', () => {
  it('keeps all 22 operational children reachable and palette-indexed', () => {
    const operationalIds = ['inventory', 'stock-out', 'finance', 'reports']
    const children = NAV_ITEMS.filter((item) =>
      operationalIds.includes(item.id),
    ).flatMap((item) => item.children ?? [])

    expect(children).toHaveLength(22)
    for (const child of children) {
      expect(
        NAV_DESTINATIONS.some(
          (destination) =>
            destination.path === child.path &&
            destination.label === `Mở ${child.label}`,
        ),
      ).toBe(true)
    }
  })

  it('homes banks in Danh Mục and removes the stale management invoice tab', () => {
    const catalog = NAV_ITEMS.find((item) => item.id === 'catalog')
    const hr = NAV_ITEMS.find((item) => item.id === 'hr')
    const manage = NAV_ITEMS.find((item) => item.id === 'manage')

    expect(catalog?.children?.at(-1)).toEqual({
      label: 'Ngân hàng',
      path: ROUTES.catalogBanks,
    })
    expect(hr?.children?.some((child) => child.path === ROUTES.hrBanks)).toBe(
      false,
    )
    expect(
      manage?.children?.some((child) => child.path === ROUTES.manageInvoices),
    ).toBe(false)
  })

  it('sources representative permission-menu paths from ROUTES', () => {
    expect(MENU_ROWS.find((row) => row.id === 'menu-1')?.duongDan).toBe(
      ROUTES.home,
    )
    expect(MENU_ROWS.find((row) => row.id === 'menu-13')?.duongDan).toBe(
      ROUTES.inventoryStockView,
    )
  })
})

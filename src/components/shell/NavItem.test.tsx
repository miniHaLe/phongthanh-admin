import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { isNavItemActive } from './navigation-command-utils'
import { ROUTES } from '@/constants/routes'

describe('sidebar active matching', () => {
  it('matches exact path segments, not overlapping prefixes', () => {
    expect(isNavItemActive(ROUTES.repairKt, ROUTES.repairList)).toBe(false)
    expect(isNavItemActive(ROUTES.repairKt, ROUTES.repairKt)).toBe(true)
    expect(isNavItemActive(ROUTES.inventoryStockView, ROUTES.inventory)).toBe(
      true,
    )
  })

  it('renders exactly one active sidebar item', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.repairKt]}>
        <Sidebar />
      </MemoryRouter>,
    )
    expect(screen.getAllByText('Sửa Chữa-Bảo Hành')).toHaveLength(1)
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })
})

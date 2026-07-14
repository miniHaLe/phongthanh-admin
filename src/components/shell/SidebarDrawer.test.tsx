import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { setAccessToken } from '@/api/auth-token'
import { renderWithProviders } from '@/test/render-with-providers'
import { useSidebarStore } from '@/store/sidebar-store'
import { useAppStore } from '@/store/app-store'
import { SidebarDrawer } from './SidebarDrawer'

describe('SidebarDrawer', () => {
  beforeEach(() => {
    setAccessToken(tokenFor({ branchIds: [], superScope: true }))
    useSidebarStore.setState({ mobileOpen: true })
    useAppStore.setState({ activeBranch: 'dak-nong' })
  })
  afterEach(() => {
    setAccessToken(null)
    useSidebarStore.setState({ mobileOpen: false })
    useAppStore.setState({ activeBranch: 'all' })
  })

  it('keeps the branch selector reachable in the mobile drawer header', () => {
    renderWithProviders(<SidebarDrawer />)

    const drawer = screen.getByRole('dialog')
    expect(
      within(drawer).getByRole('combobox', { name: 'Chọn chi nhánh' }),
    ).toHaveTextContent('Đắk Nông')
  })
})

function tokenFor(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `header.${encoded}.signature`
}

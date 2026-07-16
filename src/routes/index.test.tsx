import { describe, expect, it } from 'vitest'
import type { ReactElement } from 'react'
import type { NavigateProps, RouteObject } from 'react-router-dom'
import { appRoutes, buildDevOnlyRoutes } from './index'
import { ROUTES } from '@/constants/routes'

function shellChildren(): RouteObject[] {
  return (
    (appRoutes as RouteObject[]).find((route) => route.path === '/')
      ?.children ?? []
  )
}

function redirectTarget(route: RouteObject | undefined): string | undefined {
  const target = (route?.element as ReactElement<NavigateProps> | undefined)
    ?.props.to
  return typeof target === 'string' ? target : undefined
}

describe('application route IA', () => {
  it('keeps operational editors outside tabbed module routes', () => {
    const children = shellChildren()
    const modulePaths = ['quan-ly-kho', 'xuat-kho', 'tai-chinh', 'bao-cao']
    const moduleRoutes = modulePaths.map((path) =>
      children.find((route) => route.path === path),
    )
    const editorPaths = [
      'quan-ly-kho/nhap-kho/tao-moi',
      'xuat-kho/cap-linh-kien/tao-moi',
      'xuat-kho/ban-hang/tao-moi',
      'xuat-kho/ban-hang/:id/sua',
      'xuat-kho/tra-hang/tao-moi',
      'xuat-kho/chuyen-kho/cung-chi-nhanh',
      'xuat-kho/chuyen-kho/khac-chi-nhanh',
      'tai-chinh/hoa-don/tao-moi',
      'sua-chua-bao-hanh/:id/sua',
    ]

    for (const path of editorPaths) {
      expect(children.some((route) => route.path === path)).toBe(true)
      expect(
        moduleRoutes.some((route) =>
          route?.children?.some((child) => child.path === path),
        ),
      ).toBe(false)
    }
  })

  it('preserves moved URLs through redirects', () => {
    const children = shellChildren()
    expect(
      redirectTarget(
        children.find((route) => route.path === 'nhan-su/ngan-hang'),
      ),
    ).toBe(ROUTES.catalogBanks)
    expect(
      redirectTarget(
        children.find((route) => route.path === 'quan-ly/hoa-don'),
      ),
    ).toBe(ROUTES.financeInvoices)
  })

  it('restores the news list and real detail routes', () => {
    const children = shellChildren()
    expect(children.find((route) => route.path === 'tin-tuc')).toBeDefined()
    const detailRoute = children.find((route) => route.path === 'tin-tuc/:id')
    expect(detailRoute?.element).toBeDefined()
    expect(redirectTarget(detailRoute)).toBeUndefined()
  })

  it('DEV-gates the Gallery route', () => {
    expect(buildDevOnlyRoutes(false)).toEqual([])
    expect(buildDevOnlyRoutes(true).map((route) => route.path)).toEqual([
      'gallery',
    ])
  })
})

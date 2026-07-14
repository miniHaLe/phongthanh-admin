import { expect, test } from '@playwright/test'
import {
  captureUiuxScreenshot,
  collectConsoleProblems,
  expectFooterDoesNotOverlapMain,
  expectMobileInputFonts,
  expectMobileTargets,
  expectNoConsoleProblems,
  expectNoDocumentHorizontalOverflow,
  gotoProtectedRoute,
} from './uiux-audit-helpers'
import {
  DASHBOARD_VIEWPORTS,
  MOBILE_VIEWPORTS,
  UIUX_VIEWPORTS,
} from './uiux-viewports'

const ROUTE_SMOKE = [
  { name: 'dashboard', path: '/trang-chu', heading: 'Trang chủ' },
  {
    name: 'repair-list',
    path: '/sua-chua-bao-hanh',
    heading: 'Sửa Chữa - Bảo Hành',
  },
  {
    name: 'legacy-news-redirect',
    path: '/tin-tuc',
    heading: 'Thông báo',
    expectedPath: '/thong-bao',
  },
  { name: 'customers', path: '/khach-hang', heading: 'Khách hàng' },
]

test.describe('UIUX runtime route matrix', () => {
  for (const viewport of UIUX_VIEWPORTS) {
    for (const route of ROUTE_SMOKE) {
      test(`${route.name} renders cleanly at ${viewport.name}`, async ({
        page,
      }, testInfo) => {
        const consoleProblems = collectConsoleProblems(page)
        await gotoProtectedRoute(page, route.path, viewport)
        if ('expectedPath' in route) {
          await expect(page).toHaveURL(new RegExp(`${route.expectedPath}$`))
        }
        await expect(
          page.getByRole('heading', { name: route.heading }).first(),
        ).toBeVisible()
        await expectNoDocumentHorizontalOverflow(page)
        await expectNoConsoleProblems(consoleProblems)
        await captureUiuxScreenshot(
          page,
          testInfo,
          `${route.name}-${viewport.name}`,
        )
      })
    }
  }
})

test.describe('UIUX mobile shell and controls', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    test(`mobile targets and input fonts pass at ${viewport.name}`, async ({
      page,
    }) => {
      await gotoProtectedRoute(page, '/sua-chua-bao-hanh', viewport)
      await expectNoDocumentHorizontalOverflow(page)
      await expectFooterDoesNotOverlapMain(page)
      await expectMobileTargets(page)
      await expectMobileInputFonts(page)

      await page.getByRole('button', { name: 'Mở menu' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await expectMobileTargets(page)
    })
  }
})

test.describe('UIUX repair mobile workflow', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    test(`repair filters and card actions work at ${viewport.name}`, async ({
      page,
    }) => {
      await gotoProtectedRoute(page, '/sua-chua-bao-hanh', viewport)
      const repairFilters = page.locator('[data-repair-filters]')
      await expect(repairFilters).toBeVisible()
      await repairFilters
        .getByRole('button', { name: /Bộ lọc nâng cao/ })
        .click()
      await expect(
        repairFilters.getByRole('combobox', {
          name: 'Chi nhánh',
          exact: true,
        }),
      ).toBeVisible()

      const cardList = page.getByLabel('Danh sách phiếu sửa chữa')
      await expect(cardList).toBeVisible()
      await page
        .getByRole('checkbox', { name: /Chọn phiếu/ })
        .first()
        .click()
      await expect(
        page.getByRole('region', { name: 'Thao tác hàng loạt' }),
      ).toBeVisible()
      await page.getByRole('button', { name: 'Đổi tình trạng' }).first().click()
      await expect(page.getByRole('dialog')).toBeVisible()
    })
  }
})

test.describe('UIUX dashboard large-screen composition', () => {
  for (const viewport of DASHBOARD_VIEWPORTS) {
    test(`dashboard has deliberate large-screen metrics at ${viewport.name}`, async ({
      page,
    }) => {
      await gotoProtectedRoute(page, '/trang-chu', viewport)
      const metrics = await page
        .locator('[data-dashboard-main]')
        .evaluate((el) => {
          const rect = el.getBoundingClientRect()
          const tiles = Array.from(el.querySelectorAll('[role="button"]'))
            .map((tile) => tile.getBoundingClientRect())
            .filter((rect) => rect.width > 120 && rect.height > 80)
          return {
            width: rect.width,
            largestTileHeight: Math.max(...tiles.map((rect) => rect.height)),
            tileCount: tiles.length,
          }
        })
      expect(metrics.width).toBeLessThanOrEqual(1840)
      expect(metrics.width).toBeGreaterThan(
        viewport.width >= 1920 ? 1100 : 1000,
      )
      expect(metrics.tileCount).toBeGreaterThanOrEqual(4)
      expect(metrics.largestTileHeight).toBeGreaterThanOrEqual(
        viewport.width >= 1920 ? 140 : 120,
      )
    })
  }
})

test('legacy news URLs render only the consolidated notification surface', async ({
  page,
}) => {
  const consoleProblems = collectConsoleProblems(page)
  await gotoProtectedRoute(page, '/tin-tuc/bai-viet-cu', {
    name: 'phone-375',
    width: 375,
    height: 812,
  })

  await expect(page).toHaveURL(/\/thong-bao$/)
  await expect(page.getByRole('heading', { name: 'Thông báo' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tin tức' })).toHaveCount(0)
  const nestedButtons = await page.locator('button button').count()
  expect(nestedButtons).toBe(0)
  expect(
    consoleProblems.some((text) => text.includes('validateDOMNesting')),
  ).toBe(false)
})

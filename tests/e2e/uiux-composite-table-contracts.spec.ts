import { expect, test, type Page } from '@playwright/test'
import {
  expectAccessibleTableScrollRegion,
  expectNoDocumentHorizontalOverflow,
  expectNoMainHorizontalOverflowTrap,
  expectProtectedTableValuesFit,
  expectTableFitsFrame,
  gotoProtectedRoute,
} from './uiux-audit-helpers'
import { COMPOSITE_TABLE_ROUTES } from './uiux-composite-table-routes'

const DESKTOP_1920 = {
  name: 'desktop-1920',
  width: 1920,
  height: 1080,
} as const

test.describe('UIUX composite table hard gates', () => {
  test('all composite routes fit with the sidebar collapsed at desktop-1920', async ({
    page,
  }) => {
    test.slow()
    await gotoProtectedRoute(page, COMPOSITE_TABLE_ROUTES[0].path, DESKTOP_1920)
    await page.getByRole('button', { name: 'Thu gọn thanh bên' }).click()
    await expect(
      page.getByRole('button', { name: 'Mở rộng thanh bên' }),
    ).toBeVisible()

    for (const route of COMPOSITE_TABLE_ROUTES) {
      await gotoProtectedRoute(page, route.path, DESKTOP_1920)
      await expect(
        page.getByRole('button', { name: 'Mở rộng thanh bên' }),
      ).toBeVisible()
      await expectTableFitsFrame(page)
      await expectProtectedTableValuesFit(page)
    }
  })

  test('synthetic overlength protected value overflows only the table frame', async ({
    page,
  }) => {
    await gotoProtectedRoute(page, '/tai-chinh/thu-chi', DESKTOP_1920)
    const protectedValue = page
      .locator('[data-table-protected]:visible')
      .first()
    await expect(protectedValue).toBeVisible()

    const longToken = `PTT-${'OVERLENGTH'.repeat(32)}`
    await protectedValue.evaluate((element, value) => {
      element.textContent = value
    }, longToken)
    await expect(protectedValue).toHaveText(longToken)

    await expectProtectedTableValuesFit(page)
    await expectNoDocumentHorizontalOverflow(page)
    await expectNoMainHorizontalOverflowTrap(page)

    const frame = page.locator('[data-table-scroll-frame]').first()
    await expect
      .poll(() =>
        frame.evaluate((element) => element.scrollWidth - element.clientWidth),
      )
      .toBeGreaterThan(1)
    await expectAccessibleTableScrollRegion(page)

    const rightEdge = await frame.evaluate((element) => ({
      scrollLeft: element.scrollLeft,
      maxScrollLeft: element.scrollWidth - element.clientWidth,
    }))
    expect(rightEdge.scrollLeft).toBeGreaterThanOrEqual(
      rightEdge.maxScrollLeft - 1,
    )
  })

  test('repair, issued parts, and finance retain dark surfaces and focus', async ({
    page,
  }) => {
    await installDarkTheme(page)

    for (const routePath of [
      '/sua-chua-bao-hanh',
      '/quan-ly-kho/thu-hoi-lk',
      '/tai-chinh/thu-chi',
    ]) {
      await gotoProtectedRoute(page, routePath, DESKTOP_1920)
      await expect(page.locator('html')).toHaveClass(/dark/)

      const frame = page.locator('[data-table-scroll-frame]').first()
      await frame.press('Home')
      await expect(frame).toBeFocused()

      const surface = await frame.evaluate((element) => {
        const card = element.parentElement
        const cardStyle = card ? window.getComputedStyle(card) : null
        const frameStyle = window.getComputedStyle(element)
        return {
          backgroundColor: cardStyle?.backgroundColor,
          borderColor: cardStyle?.borderColor,
          boxShadow: frameStyle.boxShadow,
        }
      })
      expect(surface.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(surface.borderColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(surface.boxShadow).not.toBe('none')
    }
  })

  test('finance export and print workflows remain usable', async ({ page }) => {
    await gotoProtectedRoute(page, '/tai-chinh/thu-chi', DESKTOP_1920)

    const downloadPromise = page.waitForEvent('download')
    await page
      .getByRole('button', { name: 'Xuất ra Excel', exact: true })
      .click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('thu-chi.xlsx')

    const popupPromise = page.waitForEvent('popup')
    await page
      .getByRole('button', { name: /^In phiếu / })
      .first()
      .click()
    const popup = await popupPromise
    await expect.poll(() => popup.title()).toMatch(/^Phiếu (Thu|Chi)$/)
    await expect(popup.locator('body')).toContainText(/PHIẾU (THU|CHI)/)
    await popup.close()
  })

  test('issued-parts detail action opens its real voucher dialog', async ({
    page,
  }) => {
    await gotoProtectedRoute(page, '/quan-ly-kho/thu-hoi-lk', DESKTOP_1920)
    await page
      .getByRole('button', { name: 'Chi tiết', exact: true })
      .first()
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Chi tiết phiếu cấp')
    await expect(dialog).toContainText('Số phiếu cấp')
    await dialog.getByRole('button', { name: 'Đóng' }).click()
    await expect(dialog).toHaveCount(0)
  })
})

async function installDarkTheme(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'pt-app',
      JSON.stringify({
        state: {
          theme: 'dark',
          sidebarCollapsed: false,
          activeBranch: 'all',
        },
        version: 0,
      }),
    )
  })
}

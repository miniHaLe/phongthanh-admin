import { expect, test } from '@playwright/test'
import {
  captureUiuxScreenshot,
  collectConsoleProblems,
  expectAccessibleTableScrollRegion,
  expectMobileInputFonts,
  expectMobileTargets,
  expectNoConsoleProblems,
  expectNoDocumentHorizontalOverflow,
  expectNoMainHorizontalOverflowTrap,
  expectProtectedTableValuesFit,
  expectTableFitsFrame,
  expectTableSortTargetsAreTouchSized,
  expectTableTypography,
  gotoProtectedRoute,
  openVisibleFilterPanel,
} from './uiux-audit-helpers'
import { UIUX_VIEWPORTS, type UiuxViewport } from './uiux-viewports'
import {
  COMPOSITE_TABLE_PATHS,
  COMPOSITE_TABLE_ROUTES,
} from './uiux-composite-table-routes'

const TABLE_HEAVY_ROUTES = [
  ...COMPOSITE_TABLE_ROUTES,
  // Residual 1366px overflow accepted on these two (24px / 70px):
  // expectAccessibleTableScrollRegion proves the scroll affordance works.
  { name: 'catalog-hang-hoa', path: '/danh-muc/hang-hoa' },
  { name: 'permissions-menu', path: '/phan-quyen/menu' },
  // khach-hang: 5 demoted columns auto-show at ≥1920 — the 1920 fit
  // assertion locks the wide-viewport legacy-parity contract. The table is
  // hidden below md (mobile card list), so skip phone viewports.
  { name: 'catalog-khach-hang', path: '/khach-hang', minWidth: 768 },
  { name: 'warehouse-ton-kho-ky-thuat', path: '/quan-ly-kho/ton-kho-ky-thuat' },
  { name: 'warehouse-nhap-kho', path: '/quan-ly-kho/nhap-kho' },
  { name: 'stockout-cap-linh-kien', path: '/xuat-kho/cap-linh-kien' },
  { name: 'stockout-ban-hang', path: '/xuat-kho/ban-hang' },
  { name: 'stockout-tra-hang', path: '/xuat-kho/tra-hang' },
  { name: 'stockout-chuyen-kho', path: '/xuat-kho/chuyen-kho' },
] as const

const DATE_FILTER_ROUTES = [
  { name: 'finance-thu-chi', path: '/tai-chinh/thu-chi' },
  { name: 'finance-cong-no', path: '/tai-chinh/cong-no' },
  { name: 'warehouse-ds-tra-lk', path: '/quan-ly-kho/ds-tra-lk' },
  { name: 'warehouse-ds-tra-lk-xac', path: '/quan-ly-kho/ds-tra-lk-xac' },
  { name: 'warehouse-thu-hoi-lk', path: '/quan-ly-kho/thu-hoi-lk' },
  { name: 'stockout-cap-linh-kien', path: '/xuat-kho/cap-linh-kien' },
  { name: 'stockout-ban-hang', path: '/xuat-kho/ban-hang' },
  { name: 'stockout-tra-hang', path: '/xuat-kho/tra-hang' },
  { name: 'stockout-chuyen-kho', path: '/xuat-kho/chuyen-kho' },
] as const

const DATE_FILTER_VIEWPORTS = UIUX_VIEWPORTS.filter((viewport) =>
  ['phone-375', 'phone-480', 'landscape-854'].includes(viewport.name),
)

test.describe('UIUX table-heavy horizontal access', () => {
  for (const viewport of UIUX_VIEWPORTS) {
    for (const route of TABLE_HEAVY_ROUTES) {
      if ('minWidth' in route && viewport.width < route.minWidth) continue

      test(`${route.name} table is reachable without page overflow at ${viewport.name}`, async ({
        page,
      }, testInfo) => {
        const consoleProblems = collectConsoleProblems(page)
        await gotoProtectedRoute(page, route.path, viewport)
        await expect(page.locator('table').first()).toBeVisible()

        await expectNoDocumentHorizontalOverflow(page)
        await expectNoMainHorizontalOverflowTrap(page)
        await expectAccessibleTableScrollRegion(page)
        await expectTableTypography(page)
        if (COMPOSITE_TABLE_PATHS.has(route.path)) {
          await expectProtectedTableValuesFit(page)
        }

        if (viewport.width <= 768) {
          await expectTableSortTargetsAreTouchSized(page)
        }

        if (viewport.name === 'desktop-1920') {
          await expectTableFitsFrame(page)
        }
        await expectNoConsoleProblems(consoleProblems)

        if (shouldCaptureTableScreenshot(viewport)) {
          await captureUiuxScreenshot(
            page,
            testInfo,
            `${route.name}-table-${viewport.name}`,
          )
        }
      })
    }
  }
})

test.describe('UIUX composite table controls', () => {
  test('repair group visibility, reset, density, and composite sorting remain usable', async ({
    page,
  }) => {
    await gotoProtectedRoute(page, '/sua-chua-bao-hanh', {
      name: 'desktop-1920',
      width: 1920,
      height: 1080,
    })

    await page.getByRole('button', { name: 'Cấu hình cột' }).click()
    await page.getByRole('button', { name: 'Gọn', exact: true }).click()

    const notesToggle = page.getByLabel('Ghi chú')
    await notesToggle.click()
    await expect(
      page.getByRole('columnheader', { name: 'Ghi chú' }),
    ).toHaveCount(0)

    await page.getByRole('button', { name: 'Đặt lại mặc định' }).click()
    await expect(
      page.getByRole('columnheader', { name: 'Ghi chú' }),
    ).toBeVisible()

    await page
      .getByRole('button', { name: /Chọn cách sắp xếp nhóm Thời gian/ })
      .click()
    await page.getByRole('menuitem', { name: 'Sắp xếp theo Ngày nhận' }).click()
    await expect(
      page.getByRole('button', { name: /đang theo Ngày nhận/ }),
    ).toBeVisible()
  })

  test('expanded and collapsed 1080p repair table both fit the frame', async ({
    page,
  }) => {
    await gotoProtectedRoute(page, '/sua-chua-bao-hanh', {
      name: 'desktop-1920',
      width: 1920,
      height: 1080,
    })
    await expectTableFitsFrame(page)

    await page.getByRole('button', { name: 'Thu gọn thanh bên' }).click()
    await expectTableFitsFrame(page)
  })
})

test.describe('UIUX date filters mobile ergonomics', () => {
  for (const viewport of DATE_FILTER_VIEWPORTS) {
    for (const route of DATE_FILTER_ROUTES) {
      test(`${route.name} date filters are usable at ${viewport.name}`, async ({
        page,
      }) => {
        await gotoProtectedRoute(page, route.path, viewport)
        await openVisibleFilterPanel(page)

        const dateInputs = page.locator('input[type="date"]:visible')
        await expect(dateInputs.first()).toBeVisible()
        expect(await dateInputs.count()).toBeGreaterThanOrEqual(2)

        if (isTouchSizedViewport(viewport)) {
          await expectMobileTargets(page)
          await expectMobileInputFonts(page)
        }

        await dateInputs.nth(0).fill('2018-01-01')
        await dateInputs.nth(1).fill('2026-12-31')

        await expect(dateInputs.nth(0)).toHaveValue('2018-01-01')
        await expect(dateInputs.nth(1)).toHaveValue('2026-12-31')
        await expect(page.locator('tbody tr').first()).toBeVisible()
      })
    }
  }
})

function shouldCaptureTableScreenshot(viewport: UiuxViewport) {
  return ['phone-480', 'desktop-1366', 'desktop-1920', 'desktop-4k'].includes(
    viewport.name,
  )
}

function isTouchSizedViewport(viewport: UiuxViewport) {
  return viewport.width < 768
}

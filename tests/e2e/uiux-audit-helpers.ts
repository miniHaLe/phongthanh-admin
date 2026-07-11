import {
  expect,
  type ConsoleMessage,
  type Page,
  type TestInfo,
} from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { UiuxViewport } from './uiux-viewports'

const consoleProblemsByPage = new WeakMap<Page, string[]>()

export async function installAuthHarness(page: Page) {
  await page.addInitScript(() => {
    // UIUX audits validate rendered contracts, not intentional mock-error states.
    Math.random = () => 0.999
  })

  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'uiux-audit-token' }),
    })
  })
}

export async function gotoProtectedRoute(
  page: Page,
  routePath: string,
  viewport: UiuxViewport,
) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  await installAuthHarness(page)

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const consoleProblems = consoleProblemsByPage.get(page)
    const attemptProblemStart = consoleProblems?.length ?? 0
    const attemptProblems: string[] = []
    const onConsole = (message: ConsoleMessage) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        attemptProblems.push(message.text())
      }
    }
    const onPageError = (error: Error) => attemptProblems.push(error.message)

    page.on('console', onConsole)
    page.on('pageerror', onPageError)

    try {
      await page.goto(routePath, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle')
      await expectRouteShellReady(page, attempt === 0 ? 3000 : 10000)
      return
    } catch (error) {
      const isRetryableRouteLoadFlake =
        attempt === 0 && attemptProblems.some(isDevServerRouteLoadProblem)

      if (!isRetryableRouteLoadFlake) throw error

      if (consoleProblems) {
        const unrelatedProblems = attemptProblems.filter(
          (text) => !isDevServerRouteLoadProblem(text),
        )
        consoleProblems.splice(
          attemptProblemStart,
          consoleProblems.length - attemptProblemStart,
          ...unrelatedProblems,
        )
      }
    } finally {
      page.off('console', onConsole)
      page.off('pageerror', onPageError)
    }
  }
}

async function expectRouteShellReady(page: Page, timeout: number) {
  await expect(page.locator('main')).toBeVisible({ timeout })

  const bodyText = await page.locator('body').innerText()
  expect(bodyText).not.toMatch(
    /Unexpected Application Error|Failed to fetch dynamically imported module/,
  )
}

export function collectConsoleProblems(page: Page) {
  const problems: string[] = []
  consoleProblemsByPage.set(page, problems)
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(message.text())
    }
  })
  page.on('pageerror', (error) => problems.push(error.message))
  return problems
}

export async function expectNoConsoleProblems(problems: string[]) {
  const unexpected = problems.filter(
    (text) =>
      !text.includes('Download the React DevTools') &&
      !text.includes('favicon.ico') &&
      !text.includes('React Router Future Flag Warning'),
  )
  expect(unexpected).toEqual([])
}

function isDevServerRouteLoadProblem(text: string) {
  return (
    text.includes('net::ERR_NETWORK_CHANGED') ||
    text.includes('Failed to fetch dynamically imported module') ||
    (text.includes(
      'The above error occurred in one of your React components',
    ) &&
      text.includes('at Lazy'))
  )
}

export async function expectMobileTargets(page: Page) {
  const failures = await page.evaluate(() => {
    const selector = [
      'button:not([disabled])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="checkbox"]:not([aria-disabled="true"])',
      '[role="radio"]:not([aria-disabled="true"])',
      '[role="switch"]:not([aria-disabled="true"])',
      '[role="combobox"]:not([aria-disabled="true"])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[data-touch-target]',
    ].join(',')
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((el) => {
        const style = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        )
      })
      .map((el) => {
        const rect = el.getBoundingClientRect()
        const name =
          el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          el.textContent?.trim() ||
          el.getAttribute('role') ||
          el.tagName
        return { name, width: rect.width, height: rect.height }
      })
      .filter((item) => item.width < 44 || item.height < 44)
  })

  expect(failures).toEqual([])
}

export async function expectMobileInputFonts(page: Page) {
  const failures = await page.evaluate(() => {
    const selector = [
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[role="combobox"]:not([aria-disabled="true"])',
    ].join(',')
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((el) => {
        const style = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        )
      })
      .map((el) => ({
        name:
          el.getAttribute('aria-label') ||
          el.getAttribute('placeholder') ||
          el.textContent?.trim() ||
          el.tagName,
        fontSize: Number.parseFloat(window.getComputedStyle(el).fontSize),
      }))
      .filter((item) => item.fontSize < 16)
  })

  expect(failures).toEqual([])
}

export async function expectFooterDoesNotOverlapMain(page: Page) {
  const overlap = await page.evaluate(() => {
    const footer = document.querySelector('footer')
    const main = document.querySelector('main')
    if (!footer || !main) return null
    const footerRect = footer.getBoundingClientRect()
    const mainRect = main.getBoundingClientRect()
    return {
      footerTop: footerRect.top,
      mainBottom: mainRect.bottom,
      overlaps: footerRect.top < mainRect.bottom - 1,
    }
  })
  expect(overlap?.overlaps).toBe(false)
}

export async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

export async function expectNoMainHorizontalOverflowTrap(page: Page) {
  const overflow = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return null
    return {
      scrollWidth: main.scrollWidth,
      clientWidth: main.clientWidth,
    }
  })

  expect(overflow).not.toBeNull()
  expect(overflow!.scrollWidth).toBeLessThanOrEqual(overflow!.clientWidth + 1)
}

export async function expectAccessibleTableScrollRegion(page: Page) {
  const frame = page.locator('[data-table-scroll-frame]').first()
  await expect(frame).toBeVisible()
  await expect(frame).toHaveAttribute('role', 'region')

  const ariaLabel = await frame.getAttribute('aria-label')
  expect(ariaLabel?.trim()).toBeTruthy()

  await frame.focus()
  await expect(frame).toBeFocused()

  const metrics = await frame.evaluate((el) => ({
    scrollLeft: el.scrollLeft,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }))

  if (metrics.scrollWidth <= metrics.clientWidth + 1) return

  const rightButton = page.locator('[data-table-scroll-button="right"]').first()
  await expect(rightButton).toBeVisible()
  await expect(rightButton).toBeEnabled()

  await rightButton.click()
  await expect
    .poll(() => frame.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(metrics.scrollLeft)

  await frame.focus()
  await page.keyboard.press('Home')
  await expect.poll(() => frame.evaluate((el) => el.scrollLeft)).toBe(0)

  await page.keyboard.press('ArrowRight')
  await expect
    .poll(() => frame.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0)
  const arrowRightScrollLeft = await frame.evaluate((el) => el.scrollLeft)

  await page.keyboard.press('ArrowLeft')
  await expect
    .poll(() => frame.evaluate((el) => el.scrollLeft))
    .toBeLessThan(arrowRightScrollLeft)

  await page.keyboard.press('End')
  await expect
    .poll(() => frame.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0)

  await expectRightmostTableContentVisible(page)
}

export async function expectTableFitsFrame(page: Page) {
  const frame = page.locator('[data-table-scroll-frame]').first()
  await expect(frame).toBeVisible()

  const metrics = await frame.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  await expectRightmostTableContentVisible(page)
}

export async function expectProtectedTableValuesFit(page: Page) {
  const visibleProtectedValues = page.locator('[data-table-protected]:visible')
  await expect(visibleProtectedValues.first()).toBeVisible()
  expect(await visibleProtectedValues.count()).toBeGreaterThan(0)

  const failures = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-table-protected]'))
      .filter((element) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0
        )
      })
      .map((element) => ({
        value: element.textContent?.trim() ?? '',
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }))
      .filter((element) => element.scrollWidth > element.clientWidth + 1),
  )

  expect(failures).toEqual([])
}

export async function expectTableSortTargetsAreTouchSized(page: Page) {
  const failures = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>('[data-table-sort-target]'),
    )
      .filter((element) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0
        )
      })
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          label:
            element.getAttribute('aria-label') ?? element.textContent ?? '',
          width: rect.width,
          height: rect.height,
        }
      })
      .filter((target) => target.width < 44 || target.height < 44),
  )

  expect(failures).toEqual([])
}

export async function expectTableTypography(page: Page) {
  const failures = await page.evaluate(() => {
    const frame = document.querySelector<HTMLElement>(
      '[data-table-scroll-frame]',
    )
    if (!frame) return ['missing table frame']

    const visible = (element: Element) => {
      const htmlElement = element as HTMLElement
      const style = window.getComputedStyle(htmlElement)
      const rect = htmlElement.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0
      )
    }

    const headerFailures = Array.from(frame.querySelectorAll('th'))
      .filter(visible)
      .filter(
        (element) =>
          Number.parseFloat(window.getComputedStyle(element).fontSize) < 13,
      )
      .map((element) => `header:${element.textContent?.trim()}`)

    const contentFailures = Array.from(frame.querySelectorAll('td, td *'))
      .filter(visible)
      .filter((element) => element.textContent?.trim())
      .filter(
        (element) =>
          Number.parseFloat(window.getComputedStyle(element).fontSize) < 12,
      )
      .map((element) => `content:${element.textContent?.trim()}`)

    return [...headerFailures, ...contentFailures]
  })

  expect(failures).toEqual([])
}

async function expectRightmostTableContentVisible(page: Page) {
  const frame = page.locator('[data-table-scroll-frame]').first()
  const table = frame.locator('table').first()
  const rightmostHeader = table.locator('thead th:visible').last()
  const rightmostCell = table
    .locator('tbody tr:visible')
    .first()
    .locator('td:visible')
    .last()

  await expect(rightmostHeader).toBeVisible()
  await expect(rightmostCell).toBeVisible()

  const bounds = await frame.evaluate((element) => {
    const snapToDevicePixel = (value: number) =>
      Math.round(value * window.devicePixelRatio) / window.devicePixelRatio
    const frameRect = element.getBoundingClientRect()
    const tableElement = element.querySelector('table')
    const header = tableElement?.querySelector('thead th:last-child')
    const cell = tableElement?.querySelector(
      'tbody tr:first-child td:last-child',
    )
    return {
      frameLeft: snapToDevicePixel(frameRect.left),
      frameRight: snapToDevicePixel(frameRect.right),
      headerLeft:
        header && snapToDevicePixel(header.getBoundingClientRect().left),
      headerRight:
        header && snapToDevicePixel(header.getBoundingClientRect().right),
      cellLeft: cell && snapToDevicePixel(cell.getBoundingClientRect().left),
      cellRight: cell && snapToDevicePixel(cell.getBoundingClientRect().right),
    }
  })

  expect(bounds.headerLeft).toBeGreaterThanOrEqual(bounds.frameLeft - 1)
  expect(bounds.headerRight).toBeLessThanOrEqual(bounds.frameRight + 1)
  expect(bounds.cellLeft).toBeGreaterThanOrEqual(bounds.frameLeft - 1)
  expect(bounds.cellRight).toBeLessThanOrEqual(bounds.frameRight + 1)
}

export async function openVisibleFilterPanel(page: Page) {
  const dateInputs = page.locator('input[type="date"]:visible')
  if ((await dateInputs.count()) > 0) return

  const toggle = page.getByRole('button', { name: /Bộ lọc/ }).first()
  if ((await toggle.count()) > 0) {
    const expanded = await toggle.getAttribute('aria-expanded')
    if (expanded !== 'true') {
      await toggle.click()
    }
  }

  if ((await dateInputs.count()) === 0) {
    const dateMode = page
      .getByRole('combobox', { name: /Tất cả\s*\/\s*Theo ngày/ })
      .first()
    if ((await dateMode.count()) > 0) {
      await dateMode.click()
      await page.getByRole('option', { name: /^Theo ngày$/ }).click()
    }
  }

  await expect(dateInputs.first()).toBeVisible()
}

export async function captureUiuxScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  const dir = path.join(
    process.cwd(),
    'plans/260711-1527-responsive-table-1080p-fit/reports/screenshots',
  )
  await mkdir(dir, { recursive: true })
  const filePath = path.join(dir, `${name}.png`)
  await page.screenshot({ path: filePath, fullPage: true })
  await testInfo.attach(name, { path: filePath, contentType: 'image/png' })
}

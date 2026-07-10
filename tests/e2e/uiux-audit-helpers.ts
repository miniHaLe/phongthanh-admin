import { expect, type Page, type TestInfo } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { UiuxViewport } from './uiux-viewports'

export async function installAuthHarness(page: Page) {
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
  await page.goto(routePath)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('main')).toBeVisible()
}

export function collectConsoleProblems(page: Page) {
  const problems: string[] = []
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

export async function captureUiuxScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  const dir = path.join(
    process.cwd(),
    'plans/reports/260711-uiux-remediation-verification/screenshots',
  )
  await mkdir(dir, { recursive: true })
  const filePath = path.join(dir, `${name}.png`)
  await page.screenshot({ path: filePath, fullPage: true })
  await testInfo.attach(name, { path: filePath, contentType: 'image/png' })
}

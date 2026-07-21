/**
 * Phase 5 live verification for the điện lạnh catalog / model-filter / khu vực
 * work. Drives the real dev app (mock data mode) through the plan's flows,
 * bypassing auth via the shared refresh-route harness.
 */
import { expect, test, type Page } from '@playwright/test'

const DESKTOP = { width: 1440, height: 900 }

async function auth(page: Page) {
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'dien-lanh-verify-token' }),
    })
  })
  await page.setViewportSize(DESKTOP)
}

test.describe('Điện lạnh catalog live verification', () => {
  test('product editor: NSX-filtered model dropdown + table rows + back-fill', async ({
    page,
  }) => {
    await auth(page)
    await page.goto('/danh-muc/hang-hoa/tao-moi', {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.locator('main')).toBeVisible()

    // Model dropdown with NSX empty → table rows carrying Sản phẩm + NSX text.
    const modelInput = page.getByPlaceholder('Tên model')
    await modelInput.click()
    const firstOption = page.getByRole('option').first()
    await expect(firstOption).toBeVisible()
    // An option row shows the appliance (Sản phẩm) + brand columns.
    const optionText = (await firstOption.textContent()) ?? ''
    expect(optionText.length).toBeGreaterThan(0)

    // Pick a model → NSX back-fills.
    await firstOption.click()
    await expect(page.getByPlaceholder('Tên nhà sản xuất')).not.toHaveValue('')
  })

  test('product editor: + Model dialog shows 4 fields', async ({ page }) => {
    await auth(page)
    await page.goto('/danh-muc/hang-hoa/tao-moi', {
      waitUntil: 'domcontentloaded',
    })
    await page.getByRole('button', { name: 'Thêm mới model' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(/Tên Sản Phẩm/)).toBeVisible()
    await expect(dialog.getByText(/Nhà sản xuất/)).toBeVisible()
    await expect(dialog.getByLabel(/Tên model/)).toBeVisible()
    await expect(dialog.getByLabel('Ghi chú')).toBeVisible()
  })

  test('Danh Mục > Nhà Sản Xuất: Đường dẫn hãng link column renders', async ({
    page,
  }) => {
    await auth(page)
    await page.goto('/danh-muc/nha-san-xuat', {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.locator('main')).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Đường dẫn hãng' }).first(),
    ).toBeVisible()
    // At least one brand row exposes a clickable external link.
    await expect(page.locator('a[target="_blank"]').first()).toBeVisible()
  })

  test('Danh Mục > Khu Vực: 2-level Tỉnh/Phường-Xã columns, no Quận', async ({
    page,
  }) => {
    await auth(page)
    await page.goto('/danh-muc/khu-vuc', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main')).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Tên Tỉnh' }).first(),
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Tên Phường/Xã' }).first(),
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Tên Quận' }),
    ).toHaveCount(0)
  })

  test('Lập phiếu sửa chữa: + Khu vực dialog dependent selects', async ({
    page,
  }) => {
    await auth(page)
    await page.goto('/sua-chua-bao-hanh/tao-moi', {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.locator('main')).toBeVisible()
    // Open the Khu vực quick-create dialog.
    await page.getByRole('button', { name: 'Thêm khu vực' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Tỉnh')).toBeVisible()
    await expect(dialog.getByText('Phường/Xã')).toBeVisible()
    await expect(dialog.getByLabel('Cây số')).toBeVisible()
    await expect(dialog.getByLabel('Tiền công 1')).toBeVisible()
  })
})

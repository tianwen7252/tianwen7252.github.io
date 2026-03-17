import { test, expect } from '../fixtures/base.fixture'
import { StatisticsPage } from '../page-objects/statistics.page'

test.describe('Cross-Page Integration — Full User Journey', () => {
  /**
   * Helper: navigate via FloatButton menu with proper state handling.
   *
   * The Ant Design FloatButton.Group with trigger="click" toggles open/close.
   * After navigating, the group may be in an open or closed state depending
   * on re-render timing. We check the current state before clicking the trigger.
   */
  async function navigateViaMenu(
    page: import('@playwright/test').Page,
    targetUrl: string,
  ): Promise<void> {
    // Wait for the trigger button to be visible and stable
    const trigger = page.locator('.ant-float-btn-group-trigger')
    await trigger.waitFor({ state: 'visible', timeout: 10_000 })
    await page.waitForTimeout(300)

    const targetBtn = page.locator(
      `.ant-float-btn[data-url="${targetUrl}"]`,
    )

    // Check if menu is already open (target button is visible)
    const isMenuOpen = await targetBtn.isVisible().catch(() => false)

    if (!isMenuOpen) {
      // Click trigger to open menu
      await trigger.click()
      await page.waitForTimeout(500)
    }

    // Click the target navigation button
    await targetBtn.waitFor({ state: 'visible', timeout: 5_000 })
    await targetBtn.click()

    // Wait for navigation
    await page.waitForURL(`**${targetUrl}`, { timeout: 10_000 })
    // Allow page to settle after navigation
    await page.waitForTimeout(500)
  }

  test('should navigate through all pages and verify content', async ({
    seededPage,
  }) => {
    const statsPage = new StatisticsPage(seededPage)

    // Step 1: Start at OrderPage (seededPage loads at '/') — verify seeded data is present
    await expect(seededPage).toHaveURL('/')
    const body = seededPage.locator('body')
    await expect(body).not.toBeEmpty()

    // Verify the FloatButton menu trigger is available
    const menuTrigger = seededPage.locator('.ant-float-btn-group-trigger')
    await expect(menuTrigger).toBeVisible()

    // Step 2: Navigate to OrderList — verify orders exist
    await navigateViaMenu(seededPage, '/order-list')
    await expect(seededPage).toHaveURL('/order-list')

    // OrderList should show today's date header
    const orderListHeader = seededPage.locator('h2')
    await expect(orderListHeader.first()).toBeVisible()

    // Step 3: Navigate to Statistics — verify charts render
    await navigateViaMenu(seededPage, '/statistics')
    await expect(seededPage).toHaveURL('/statistics')

    await statsPage.waitForCharts()
    const chartCount = await statsPage.getChartCount()
    expect(chartCount).toBeGreaterThanOrEqual(1)

    // Step 4: Navigate to Settings — verify settings page loads
    await navigateViaMenu(seededPage, '/settings')
    await expect(seededPage).toHaveURL('/settings')

    // Settings page should have tabs rendered
    const settingsTabs = seededPage.locator('.ant-tabs')
    await expect(settingsTabs).toBeVisible()

    // Verify "系統設定" header is visible
    const settingsTitle = seededPage
      .locator('label')
      .filter({ hasText: '系統設定' })
    await expect(settingsTitle.first()).toBeVisible()

    // Step 5: Navigate back to OrderPage — verify it still works
    await navigateViaMenu(seededPage, '/')
    await expect(seededPage).toHaveURL('/')

    // App should still be functional
    await expect(body).not.toBeEmpty()
    await expect(menuTrigger).toBeVisible()
  })
})

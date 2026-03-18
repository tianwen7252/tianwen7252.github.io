import { test, expect } from '../../fixtures/base.fixture'
import { SettingsPage } from '../../page-objects/settings.page'

test.describe('Settings - Products Tab', () => {
  test('should display commodity type list', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    // Switch to the product tab
    await settings.switchTab('product')
    await settings.waitForTabContent()

    // Verify the "商品種類" heading is visible
    const heading = seededPage.locator('h2', { hasText: '商品種類' })
    await expect(heading).toBeVisible()

    // Verify the commodity type table has rows matching seeded types
    const typeRows = await settings.getCommodityTypeRows()
    expect(typeRows).toBeGreaterThanOrEqual(3)
  })

  test('should display commodity list within tabs', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    await settings.switchTab('product')
    await settings.waitForTabContent()

    // Verify the "商品設定" heading is visible
    const heading = seededPage.locator('h2', { hasText: '商品設定' })
    await expect(heading).toBeVisible()

    // The commodity tabs container should exist
    const commodityTabs = seededPage.locator('#resta-settings-commondity-tabs')
    await expect(commodityTabs).toBeVisible()

    // The first tab should show commodity rows from the seeded data
    const commodityRows = await settings.getCommodityRows()
    expect(commodityRows).toBeGreaterThanOrEqual(1)
  })
})

import { test, expect } from '../../fixtures/base.fixture'
import { SettingsPage } from '../../page-objects/settings.page'

test.describe('Settings - Info Tab', () => {
  test('should display the app version number', async ({ cleanPage }) => {
    const settings = new SettingsPage(cleanPage)
    await settings.goto('/settings')

    // The info tab is the default active tab
    await settings.waitForTabContent()

    // Verify the "本機App版本" card shows a version string (e.g., "v1.2.3")
    const versionValue = await settings.getInfoVersion()
    expect(versionValue).toMatch(/^v\d+\.\d+\.\d+/)
  })

  test('should display storage usage information', async ({ cleanPage }) => {
    const settings = new SettingsPage(cleanPage)
    await settings.goto('/settings')
    await settings.waitForTabContent()

    // Verify the storage info cards are present
    const storageCards = await settings.getStorageInfoCards()
    expect(storageCards).toHaveLength(3)

    // Each card should have a title from the known set
    const expectedTitles = ['本機資料庫使用量', '本機資料庫剩餘量', '本機資料庫使用率']
    for (const title of expectedTitles) {
      const card = settings.page.locator('.ant-statistic-title', { hasText: title })
      await expect(card).toBeVisible()
    }
  })
})

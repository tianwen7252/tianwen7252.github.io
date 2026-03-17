import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Page Object Model for the Settings page.
 * Handles tab switching and interaction with all settings sub-pages:
 * - info: System info (version, storage)
 * - staff: Staff clock-in
 * - staff-admin: Staff admin (AuthGuard protected)
 * - product: Product settings
 * - backup: Cloud backup (AuthGuard protected)
 */
export class SettingsPage extends BasePage {
  readonly tabsContainer: Locator
  readonly settingsHeader: Locator

  constructor(page: Page) {
    super(page)
    this.tabsContainer = page.locator('.ant-tabs')
    this.settingsHeader = page.locator('label', { hasText: '系統設定' })
  }

  /**
   * Switch to a specific tab by its key.
   * Tab keys: 'info', 'staff', 'staff-admin', 'product', 'backup'
   */
  async switchTab(tabKey: string): Promise<void> {
    // Ant Design Tabs renders tab buttons with id pattern: rc-tabs-N-tab-{key}
    const tab = this.page.locator(`[data-node-key="${tabKey}"]`)
    await tab.click()
    // Allow tab transition animation to complete
    await this.page.waitForTimeout(500)
  }

  /**
   * Wait for the active tab's content panel to be visible.
   */
  async waitForTabContent(): Promise<void> {
    await this.page.waitForSelector('.ant-tabs-tabpane-active', {
      state: 'visible',
      timeout: 10_000,
    })
  }

  /**
   * Get the active tab content element.
   */
  getActiveTabContent(): Locator {
    return this.page.locator('.ant-tabs-tabpane-active')
  }

  /**
   * Get the app version string from the Info tab.
   * Reads the value from the "本機App版本" Statistic card.
   */
  async getInfoVersion(): Promise<string> {
    const versionCard = this.page.locator('.ant-statistic', {
      has: this.page.locator('.ant-statistic-title', { hasText: '本機App版本' }),
    })
    const prefix = await versionCard
      .locator('.ant-statistic-content-prefix')
      .textContent()
    const value = await versionCard
      .locator('.ant-statistic-content-value')
      .textContent()
    return `${prefix ?? ''}${value ?? ''}`
  }

  /**
   * Get the storage info Statistic cards from the third row of the Info tab.
   * Returns locators for the 3 storage cards.
   */
  async getStorageInfoCards(): Promise<Locator[]> {
    const titles = ['本機資料庫使用量', '本機資料庫剩餘量', '本機資料庫使用率']
    return titles.map((title) =>
      this.page.locator('.ant-statistic', {
        has: this.page.locator('.ant-statistic-title', { hasText: title }),
      }),
    )
  }

  /**
   * Get the number of commodity type rows in the Products tab.
   */
  async getCommodityTypeRows(): Promise<number> {
    // The first table on the Products tab is the commodity type table
    const typeTable = this.page
      .locator('.ant-tabs-tabpane-active')
      .locator('.ant-table')
      .first()
    const rows = typeTable.locator('.ant-table-tbody tr')
    return rows.count()
  }

  /**
   * Get the number of commodity rows in the currently active commodity sub-tab.
   */
  async getCommodityRows(): Promise<number> {
    const commodityTabs = this.page.locator('#resta-settings-commondity-tabs')
    const rows = commodityTabs.locator(
      '.ant-tabs-tabpane-active .ant-table-tbody tr',
    )
    return rows.count()
  }

  /**
   * Get the number of staff clock-in cards displayed in the Staff tab.
   */
  async getStaffClockInCards(): Promise<number> {
    const activePane = this.getActiveTabContent()
    const cards = activePane.locator('.ant-card')
    return cards.count()
  }

  /**
   * Check if the AuthGuard Result component is visible (403 / permission denied).
   */
  async isAuthGuardVisible(): Promise<boolean> {
    const result = this.page.locator('.ant-result')
    return result.isVisible()
  }

  /**
   * Get a list of employee names from the StaffAdmin table.
   */
  async getStaffList(): Promise<string[]> {
    const rows = this.page.locator('.ant-table-tbody tr')
    const count = await rows.count()
    const names: string[] = []
    for (let i = 0; i < count; i++) {
      const name = await rows.nth(i).locator('td').nth(1).textContent()
      if (name) names.push(name.trim())
    }
    return names
  }
}

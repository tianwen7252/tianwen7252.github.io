import type { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the AppHeader component.
 * Encapsulates the FloatButton navigation group used across all pages.
 */
export class AppHeaderComponent {
  readonly page: Page
  readonly menuTrigger: Locator
  readonly orderButton: Locator
  readonly orderListButton: Locator
  readonly statisticsButton: Locator
  readonly settingsButton: Locator
  readonly reloadButton: Locator

  constructor(page: Page) {
    this.page = page
    this.menuTrigger = page.locator('.ant-float-btn-group-trigger')

    // FloatButton items identified by data-url attribute
    this.orderButton = page.locator('.ant-float-btn[data-url="/"]')
    this.orderListButton = page.locator(
      '.ant-float-btn[data-url="/order-list"]',
    )
    this.statisticsButton = page.locator(
      '.ant-float-btn[data-url="/statistics"]',
    )
    this.settingsButton = page.locator(
      '.ant-float-btn[data-url="/settings"]',
    )

    // Reload button is the last FloatButton without a data-url
    this.reloadButton = page.locator(
      '.ant-float-btn:not([data-url]):not(.ant-float-btn-group-trigger)',
    )
  }

  /**
   * Open the floating menu by clicking the trigger button.
   */
  async open(): Promise<void> {
    await this.menuTrigger.click()
    // Allow animation to complete
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to the Order (home) page.
   */
  async goToOrder(): Promise<void> {
    await this.open()
    await this.orderButton.click()
    await this.page.waitForURL('**/')
  }

  /**
   * Navigate to the Order List page.
   */
  async goToOrderList(): Promise<void> {
    await this.open()
    await this.orderListButton.click()
    await this.page.waitForURL('**/order-list')
  }

  /**
   * Navigate to the Statistics page.
   */
  async goToStatistics(): Promise<void> {
    await this.open()
    await this.statisticsButton.click()
    await this.page.waitForURL('**/statistics')
  }

  /**
   * Navigate to the Settings page.
   */
  async goToSettings(): Promise<void> {
    await this.open()
    await this.settingsButton.click()
    await this.page.waitForURL('**/settings')
  }

  /**
   * Check if the menu trigger is visible on the page.
   */
  async isVisible(): Promise<boolean> {
    return this.menuTrigger.isVisible()
  }
}

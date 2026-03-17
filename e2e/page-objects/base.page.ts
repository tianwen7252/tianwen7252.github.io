import type { Page, Locator } from '@playwright/test'

/**
 * Base Page Object providing common navigation and interaction patterns.
 * All page objects should extend this class.
 */
export class BasePage {
  readonly page: Page
  readonly floatButtonTrigger: Locator
  readonly floatButtonGroup: Locator

  constructor(page: Page) {
    this.page = page
    this.floatButtonTrigger = page.locator('.ant-float-btn-group-trigger')
    this.floatButtonGroup = page.locator('.ant-float-btn-group')
  }

  /**
   * Navigate to a given path and wait for network idle.
   */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path)
    await this.waitForPageLoad()
  }

  /**
   * Wait for the page to be fully loaded.
   * Waits for the React root and FloatButton to be visible.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector('#root', {
      state: 'attached',
      timeout: 15_000,
    })
    await this.page.waitForSelector('.ant-float-btn', {
      state: 'visible',
      timeout: 15_000,
    })
  }

  /**
   * Open the FloatButton navigation menu.
   */
  async openFloatMenu(): Promise<void> {
    await this.floatButtonTrigger.click()
    // Wait for the menu animation to complete
    await this.page.waitForTimeout(300)
  }

  /**
   * Navigate to a page via the FloatButton menu.
   * @param url - The target route (e.g., '/', '/order-list', '/statistics', '/settings')
   */
  async navigateViaFloatButton(url: string): Promise<void> {
    await this.openFloatMenu()
    const btn = this.page.locator(`.ant-float-btn[data-url="${url}"]`)
    await btn.click()
    // Wait for navigation to settle
    await this.page.waitForURL(`**${url}`)
  }
}

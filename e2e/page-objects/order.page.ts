import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'
import { KeyboardComponent } from './keyboard.component'

/**
 * Page Object Model for the OrderPage (main POS ordering page).
 * Contains the Keyboard component and an order Drawer on the right side.
 */
export class OrderPage extends BasePage {
  readonly keyboard: KeyboardComponent

  // The order drawer on the right side
  readonly orderDrawer: Locator

  // Drawer title showing date
  readonly drawerTitle: Locator

  // Order cards within the drawer
  readonly orderCards: Locator

  // Summary section in the drawer footer
  readonly drawerFooter: Locator

  constructor(page: Page) {
    super(page)
    this.keyboard = new KeyboardComponent(page)
    this.orderDrawer = page.locator('.ant-drawer')
    this.drawerTitle = page.locator('.ant-drawer-title')
    this.orderCards = page.locator('.ant-drawer .resta-order-card')
    this.drawerFooter = page.locator('.ant-drawer-footer')
  }

  /**
   * Navigate to the OrderPage (home route).
   */
  async goto(): Promise<void> {
    await super.goto('/')
  }

  /**
   * Wait for the order page to be fully loaded including keyboard and drawer.
   */
  async waitForOrderPageReady(): Promise<void> {
    await this.waitForPageLoad()
    await this.keyboard.waitForReady()
    await this.orderDrawer.waitFor({ state: 'visible', timeout: 10_000 })
  }

  /**
   * Create an order by clicking commodity buttons and submitting.
   * @param items - Array of commodity names to add to the order
   * @param orderTypes - Optional array of order type names to select
   */
  async createOrder(
    items: string[],
    orderTypes?: string[],
  ): Promise<void> {
    for (const item of items) {
      await this.keyboard.clickCommodity(item)
    }

    if (orderTypes) {
      for (const type of orderTypes) {
        await this.keyboard.selectOrderType(type)
      }
    }

    await this.keyboard.clickSubmit()
  }

  /**
   * Get the count of order cards displayed in the drawer.
   */
  async getOrderCount(): Promise<number> {
    // Wait a moment for the order to appear after submission
    await this.page.waitForTimeout(500)
    return this.orderCards.count()
  }

  /**
   * Get the total amount from the latest (first visible) order card.
   * Order cards display total as "$ {amount}" in the footer section.
   */
  async getLatestOrderTotal(): Promise<string> {
    const firstCard = this.orderCards.first()
    const totalEl = firstCard.locator('[class*="total"]').first()
    const text = await totalEl.textContent()
    return text?.trim() ?? ''
  }

  /**
   * Get the summary statistics from the drawer footer.
   * Returns an array of statistic values.
   */
  async getDrawerSummary(): Promise<string[]> {
    const stats = this.drawerFooter.locator('.ant-statistic-content-value')
    const count = await stats.count()
    const values: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await stats.nth(i).textContent()
      if (text) values.push(text.trim())
    }
    return values
  }

  /**
   * Check if the order drawer is visible.
   */
  async isDrawerVisible(): Promise<boolean> {
    return this.orderDrawer.isVisible()
  }

  /**
   * Wait for a success notification to appear after order submission.
   */
  async waitForSuccessNotification(): Promise<void> {
    await this.page.locator('.ant-notification-notice').waitFor({
      state: 'visible',
      timeout: 5_000,
    })
  }
}

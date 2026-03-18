import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Page Object Model for the OrderList page.
 * Displays order history with search, filtering, and date range capabilities.
 */
export class OrderListPage extends BasePage {
  // Sticky header with search button and date display
  readonly header: Locator
  readonly searchButton: Locator
  readonly headerTitle: Locator

  // Main content area
  readonly mainContent: Locator

  // Order cards displayed in the list
  readonly orderCards: Locator

  // Summary statistics section
  readonly summarySection: Locator

  // Search drawer
  readonly searchDrawer: Locator

  // Section elements with date headings
  readonly sections: Locator

  constructor(page: Page) {
    super(page)
    this.header = page.locator('[class*="header"]').first()
    this.searchButton = page.getByRole('button', { name: '訂單搜尋' })
    this.headerTitle = page.locator('h2').first()
    this.mainContent = page.locator('.resta-orders-content')
    this.orderCards = page.locator('.resta-order-card')
    this.summarySection = page.locator('.ant-statistic').first().locator('..')
    this.searchDrawer = page.locator('.resta-orderlist-search-drawer')
    this.sections = page.locator('section')
  }

  /**
   * Navigate to the OrderList page.
   */
  async goto(): Promise<void> {
    await super.goto('/order-list')
  }

  /**
   * Wait for the order list page to be fully loaded.
   */
  async waitForOrderListReady(): Promise<void> {
    await this.waitForPageLoad()
    // Wait for the order list content or empty state to render
    await this.page.waitForSelector('.resta-order-card, .ant-empty', {
      state: 'visible',
      timeout: 10_000,
    })
  }

  /**
   * Get all order cards currently displayed.
   * Returns the count of order cards.
   */
  async getOrderCardCount(): Promise<number> {
    return this.orderCards.count()
  }

  /**
   * Get the summary statistics values.
   * Returns an object with order count, sold items, and totals.
   */
  async getSummary(): Promise<{
    values: string[]
    titles: string[]
  }> {
    const stats = this.page.locator('section .ant-statistic')
    const count = await stats.count()
    const values: string[] = []
    const titles: string[] = []
    for (let i = 0; i < count; i++) {
      const value = await stats
        .nth(i)
        .locator('.ant-statistic-content-value')
        .textContent()
      const title = await stats
        .nth(i)
        .locator('.ant-statistic-title')
        .textContent()
      if (value) values.push(value.trim())
      if (title) titles.push(title.trim())
    }
    return { values, titles }
  }

  /**
   * Delete an order by clicking the delete action on the nth order card.
   * The action panel contains edit and delete icons accessible via getByRole('img').
   */
  async deleteOrder(index = 0): Promise<void> {
    const card = this.orderCards.nth(index)

    // On tablet, swipe left to reveal action buttons
    const box = await card.boundingBox()
    if (box) {
      await this.page.mouse.move(
        box.x + box.width - 20,
        box.y + box.height / 2,
      )
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + 20, box.y + box.height / 2, {
        steps: 10,
      })
      await this.page.mouse.up()
      await this.page.waitForTimeout(300)
    }

    // Click the delete icon (the last clickable element in the action panel)
    const deleteBtn = card.getByRole('img', { name: 'delete' }).last()
    await deleteBtn.click()
  }

  /**
   * Confirm deletion in the modal dialog.
   */
  async confirmDelete(): Promise<void> {
    const confirmBtn = this.page.locator(
      '.ant-modal-confirm-btns .ant-btn-dangerous',
    )
    await confirmBtn.click()
  }

  /**
   * Edit an order by clicking the edit action on the nth order card.
   */
  async editOrder(index = 0): Promise<void> {
    const card = this.orderCards.nth(index)

    // Swipe left to reveal action buttons
    const box = await card.boundingBox()
    if (box) {
      await this.page.mouse.move(
        box.x + box.width - 20,
        box.y + box.height / 2,
      )
      await this.page.mouse.down()
      await this.page.mouse.move(box.x + 20, box.y + box.height / 2, {
        steps: 10,
      })
      await this.page.mouse.up()
      await this.page.waitForTimeout(300)
    }

    // Click the edit icon
    const editBtn = card.getByRole('img', { name: 'edit' }).last()
    await editBtn.click()
  }

  /**
   * Get the date heading text from the header.
   */
  async getDateHeading(): Promise<string> {
    const text = await this.headerTitle.textContent()
    return text?.trim() ?? ''
  }

  /**
   * Open the search drawer.
   */
  async openSearch(): Promise<void> {
    await this.searchButton.click()
    await this.searchDrawer.waitFor({ state: 'visible', timeout: 5_000 })
  }

  /**
   * Get the total amount from a specific order card.
   * The total is displayed as "金額 $XXX" text inside the card.
   */
  async getOrderTotal(index = 0): Promise<string> {
    const card = this.orderCards.nth(index)
    // Find the element containing "金額" text
    const totalEl = card.locator('*').filter({ hasText: /^金額/ }).first()
    const text = await totalEl.textContent()
    return text?.trim() ?? ''
  }
}

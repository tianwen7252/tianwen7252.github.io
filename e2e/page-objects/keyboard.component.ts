import type { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the Keyboard component.
 * Encapsulates all interactions with the POS number keyboard and commodity buttons.
 */
export class KeyboardComponent {
  readonly page: Page

  // Main container
  readonly container: Locator

  // Text area showing selected items and total
  readonly mealsArea: Locator
  readonly totalDisplay: Locator

  // Mode segmented control
  readonly modeSegmented: Locator

  // Clear button
  readonly clearButton: Locator

  // Submit button
  readonly submitButton: Locator

  // Tabs for commodity categories
  readonly commodityTabs: Locator

  // Order types (checkable tags)
  readonly orderTypesArea: Locator

  constructor(page: Page) {
    this.page = page

    // The keyboard root is identified by the .resta-keyboard-left class
    this.container = page.locator('.resta-keyboard-left')
    this.mealsArea = page.locator('#resta-keyboard-meals')
    this.totalDisplay = page.locator(
      '.resta-keyboard-left .resta-keyboard-textArea',
    )
    this.modeSegmented = page.locator('.resta-keyboard-left .ant-segmented')
    this.clearButton = page.getByRole('button', { name: /清除/ })
    // The submit button text defaults to "送單" (rendered as "送 單" by Ant Design).
    // For edit mode it changes to "編輯訂單 - 編號[N]".
    // We match by regex that covers both states.
    this.submitButton = this.container.getByRole('button', {
      name: /送\s*單|編輯訂單/,
    })
    this.commodityTabs = page.locator('.resta-keyboard-btn-area .ant-tabs')
    this.orderTypesArea = page
      .locator('.resta-keyboard-left')
      .locator('.ant-tag-checkable')
      .first()
      .locator('..')
  }

  /**
   * Click a commodity button by its display name.
   * These are the menu item buttons (e.g., commodity name).
   */
  async clickCommodity(name: string): Promise<void> {
    const btn = this.page
      .locator('.resta-keyboard-btn-area .ant-tabs-content .ant-btn')
      .filter({ hasText: name })
    await btn.first().click()
  }

  /**
   * Click a number button on the numeric keypad.
   * Numbers 0-9 and '.' are circle-shaped buttons.
   */
  async clickNumber(num: string): Promise<void> {
    const btn = this.page
      .locator('.resta-keyboard-btn-area button.ant-btn-circle')
      .filter({ hasText: num })
    await btn.first().click()
  }

  /**
   * Click an operator button (+, *, backspace).
   * Operators are identified by their data-meta attribute.
   */
  async clickOperator(op: string): Promise<void> {
    const btn = this.page.locator(
      `.resta-keyboard-btn-area button[data-meta="${op}"]`,
    )
    await btn.click()
  }

  /**
   * Click the submit (send order) button.
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * Click the clear/reset button.
   */
  async clickClear(): Promise<void> {
    await this.clearButton.click()
  }

  /**
   * Get the total displayed in the keyboard text area.
   * Returns the text content of the total section.
   */
  async getTotal(): Promise<string> {
    const totalEl = this.totalDisplay
      .locator('div')
      .filter({ hasText: /^=/ })
      .first()
    const text = await totalEl.textContent()
    return text?.trim() ?? ''
  }

  /**
   * Get all meal items currently displayed in the meals area.
   * Returns an array of text contents.
   */
  async getMeals(): Promise<string[]> {
    const items = this.mealsArea.locator('.ant-space')
    const count = await items.count()
    const texts: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent()
      if (text) texts.push(text.trim())
    }
    return texts
  }

  /**
   * Select/toggle an order type tag (e.g., meal or order tags).
   */
  async selectOrderType(name: string): Promise<void> {
    const tag = this.page
      .locator('.ant-tag-checkable')
      .filter({ hasText: name })
    await tag.click()
  }

  /**
   * Switch the keyboard mode between 'both' and 'commondity' using the Segmented control.
   * Clicks the second option (commondity mode) if currently in 'both' mode, or vice versa.
   */
  async switchMode(mode: 'both' | 'commondity' = 'commondity'): Promise<void> {
    const index = mode === 'both' ? 0 : 1
    const option = this.modeSegmented.locator('.ant-segmented-item').nth(index)
    await option.click()
  }

  /**
   * Switch to a specific commodity tab by label text.
   */
  async switchTab(label: string): Promise<void> {
    const tab = this.commodityTabs
      .locator('.ant-tabs-tab')
      .filter({ hasText: label })
    await tab.click()
  }

  /**
   * Check if the submit button text matches expected text.
   */
  async getSubmitButtonText(): Promise<string> {
    const text = await this.submitButton.textContent()
    return text?.trim() ?? ''
  }

  /**
   * Wait for the keyboard to be fully rendered.
   */
  async waitForReady(): Promise<void> {
    await this.container.waitFor({ state: 'visible', timeout: 10_000 })
    await this.commodityTabs.waitFor({ state: 'visible', timeout: 10_000 })
  }
}

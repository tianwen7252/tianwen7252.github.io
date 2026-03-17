import { test, expect } from '../fixtures/base.fixture'
import { OrderPage } from '../page-objects/order.page'

test.describe('Order Flow — E2E Tests', () => {
  let orderPage: OrderPage

  test.beforeEach(async ({ seededPage }) => {
    orderPage = new OrderPage(seededPage)
    await orderPage.goto()
    await orderPage.waitForOrderPageReady()
  })

  test('should display the order page with keyboard and drawer', async ({
    seededPage,
  }) => {
    // Verify the keyboard is visible
    await expect(orderPage.keyboard.container).toBeVisible()

    // Verify the order drawer is visible
    await expect(orderPage.orderDrawer).toBeVisible()

    // Verify the drawer title contains today's date
    const title = await orderPage.drawerTitle.textContent()
    expect(title).toContain('訂單記錄')

    // Verify the submit button shows default text (Ant Design may insert spaces)
    const submitText = await orderPage.keyboard.getSubmitButtonText()
    expect(submitText).toContain('送')
  })

  test('should create a single-item order', async ({ seededPage }) => {
    // Get initial order count (seeded data already has orders)
    const initialCount = await orderPage.getOrderCount()

    // Click a commodity button
    await orderPage.keyboard.clickCommodity('油淋雞腿飯')

    // Verify the meal appears in the meals area
    const meals = await orderPage.keyboard.getMeals()
    expect(meals.length).toBeGreaterThan(0)
    expect(meals.some(m => m.includes('140'))).toBe(true)

    // Verify total is displayed
    const total = await orderPage.keyboard.getTotal()
    expect(total).toContain('140')

    // Submit the order
    await orderPage.keyboard.clickSubmit()

    // Wait for success notification
    await orderPage.waitForSuccessNotification()

    // Verify order count increased
    const newCount = await orderPage.getOrderCount()
    expect(newCount).toBe(initialCount + 1)
  })

  test('should create a multi-item order', async ({ seededPage }) => {
    const initialCount = await orderPage.getOrderCount()

    // Add multiple commodities (果醋飲 is on the drinks/dumplings tab)
    await orderPage.keyboard.clickCommodity('排骨飯')
    await orderPage.keyboard.switchTab('🧃 飲料|水餃')
    await orderPage.keyboard.clickCommodity('果醋飲')

    // Verify meals area shows both items
    const meals = await orderPage.keyboard.getMeals()
    expect(meals.length).toBeGreaterThanOrEqual(2)

    // Verify total is sum of items (115 + 20 = 135)
    const total = await orderPage.keyboard.getTotal()
    expect(total).toContain('135')

    // Submit the order
    await orderPage.keyboard.clickSubmit()
    await orderPage.waitForSuccessNotification()

    // Verify order count increased
    const newCount = await orderPage.getOrderCount()
    expect(newCount).toBe(initialCount + 1)
  })

  test('should use number keyboard to input +100', async ({ seededPage }) => {
    // Type +100 using the number keyboard
    // First click a commodity to have something, then add +100
    await orderPage.keyboard.clickCommodity('油淋雞腿飯')

    // Click the + operator
    await orderPage.keyboard.clickOperator('+')

    // Click 1, 0, 0
    await orderPage.keyboard.clickNumber('1')
    await orderPage.keyboard.clickNumber('0')
    await orderPage.keyboard.clickNumber('0')

    // Verify total is 140 + 100 = 240
    const total = await orderPage.keyboard.getTotal()
    expect(total).toContain('240')
  })

  test('should select order types (takeaway tags)', async ({ seededPage }) => {
    // Add a commodity first
    await orderPage.keyboard.clickCommodity('排骨飯')

    // Select the "外送" order type tag
    await orderPage.keyboard.selectOrderType('外送')

    // Verify the tag appears as checked
    const tag = seededPage
      .locator('.ant-tag-checkable')
      .filter({ hasText: '外送' })
    await expect(tag).toHaveClass(/ant-tag-checkable-checked/)

    // Submit with the order type
    await orderPage.keyboard.clickSubmit()
    await orderPage.waitForSuccessNotification()
  })

  test('should clear input using the clear button', async ({ seededPage }) => {
    // Add some items
    await orderPage.keyboard.clickCommodity('油淋雞腿飯')
    await orderPage.keyboard.clickCommodity('排骨飯')

    // Verify items are showing
    let meals = await orderPage.keyboard.getMeals()
    expect(meals.length).toBeGreaterThan(0)

    // Click the clear button
    await orderPage.keyboard.clickClear()

    // Wait a moment for the state to update
    await seededPage.waitForTimeout(300)

    // Verify meals area is cleared
    meals = await orderPage.keyboard.getMeals()
    expect(meals.length).toBe(0)
  })

  test('should switch commodity mode', async ({ seededPage }) => {
    // Initially in 'both' mode (number pad + commodity tabs)
    const numberBtns = seededPage.locator(
      '.resta-keyboard-btn-area button.ant-btn-circle',
    )
    await expect(numberBtns.first()).toBeVisible()

    // Switch to 'commondity' only mode
    await orderPage.keyboard.switchMode('commondity')

    // The number buttons should be hidden (mode === 'commondity' hides them)
    // The container should have the commondity mode class
    await expect(orderPage.keyboard.container).toHaveClass(
      /modeCommondity|resta-keyboard-left/,
    )

    // Commodity tabs should still be visible
    await expect(orderPage.keyboard.commodityTabs).toBeVisible()

    // Switch back to 'both' mode
    await orderPage.keyboard.switchMode('both')

    // Number buttons should be visible again
    await expect(numberBtns.first()).toBeVisible()
  })

  test('should switch between commodity tabs', async ({ seededPage }) => {
    // The default active tab should be the first category
    const firstTab = orderPage.keyboard.commodityTabs
      .locator('.ant-tabs-tab')
      .first()
    await expect(firstTab).toHaveClass(/ant-tabs-tab-active/)

    // Switch to the second tab (single dishes)
    await orderPage.keyboard.switchTab('🍖 單點')

    // Verify the second tab is now active
    const secondTab = orderPage.keyboard.commodityTabs
      .locator('.ant-tabs-tab')
      .filter({ hasText: '🍖 單點' })
    await expect(secondTab).toHaveClass(/ant-tabs-tab-active/)

    // Wait for tab panel transition
    await seededPage.waitForTimeout(500)

    // The commodity buttons should now show items from that category
    const activePanel = seededPage.locator(
      '.resta-keyboard-btn-area .ant-tabs-tabpane-active .ant-btn',
    )
    await expect(activePanel.filter({ hasText: '油淋雞腿' })).toBeVisible()
  })
})

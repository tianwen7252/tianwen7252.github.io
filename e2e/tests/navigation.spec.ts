import { test, expect } from '../fixtures/base.fixture'

test.describe('Navigation — Smoke Tests', () => {
  test('should load the home page (OrderPage)', async ({ seededPage }) => {
    // Verify the app renders successfully at the root URL
    await seededPage.goto('/')
    await expect(seededPage).toHaveURL('/')

    // The app should have rendered content (not a blank page)
    const body = seededPage.locator('body')
    await expect(body).not.toBeEmpty()
  })

  test('should navigate to OrderList via FloatButton menu', async ({
    seededPage,
  }) => {
    await seededPage.goto('/')

    // Open the FloatButton group by clicking the menu trigger
    const floatButtonTrigger = seededPage.locator(
      '.ant-float-btn-group-trigger',
    )
    await floatButtonTrigger.click()

    // Click the order-list navigation button (UnorderedListOutlined icon)
    const orderListBtn = seededPage.locator(
      '.ant-float-btn[data-url="/order-list"]',
    )
    await orderListBtn.click()

    // Verify navigation to order-list page
    await expect(seededPage).toHaveURL('/order-list')
  })

  test('should navigate to Statistics via FloatButton menu', async ({
    seededPage,
  }) => {
    await seededPage.goto('/')

    const floatButtonTrigger = seededPage.locator(
      '.ant-float-btn-group-trigger',
    )
    await floatButtonTrigger.click()

    const statisticsBtn = seededPage.locator(
      '.ant-float-btn[data-url="/statistics"]',
    )
    await statisticsBtn.click()

    await expect(seededPage).toHaveURL('/statistics')
  })

  test('should navigate to Settings via FloatButton menu', async ({
    seededPage,
  }) => {
    await seededPage.goto('/')

    const floatButtonTrigger = seededPage.locator(
      '.ant-float-btn-group-trigger',
    )
    await floatButtonTrigger.click()

    const settingsBtn = seededPage.locator(
      '.ant-float-btn[data-url="/settings"]',
    )
    await settingsBtn.click()

    await expect(seededPage).toHaveURL('/settings')
  })

  test('should load lazy-loaded OrderList page directly', async ({
    seededPage,
  }) => {
    await seededPage.goto('/order-list')
    await expect(seededPage).toHaveURL('/order-list')

    // Page content should render (lazy-loaded component loaded successfully)
    const body = seededPage.locator('body')
    await expect(body).not.toBeEmpty()
  })

  test('should load lazy-loaded Statistics page directly', async ({
    seededPage,
  }) => {
    await seededPage.goto('/statistics')
    await expect(seededPage).toHaveURL('/statistics')

    const body = seededPage.locator('body')
    await expect(body).not.toBeEmpty()
  })

  test('should load lazy-loaded Settings page directly', async ({
    seededPage,
  }) => {
    await seededPage.goto('/settings')
    await expect(seededPage).toHaveURL('/settings')

    const body = seededPage.locator('body')
    await expect(body).not.toBeEmpty()
  })
})

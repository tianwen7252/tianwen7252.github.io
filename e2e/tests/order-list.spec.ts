import { test, expect } from '../fixtures/base.fixture'
import { OrderListPage } from '../page-objects/order-list.page'

test.describe('Order List — E2E Tests', () => {
  let orderListPage: OrderListPage

  test.beforeEach(async ({ seededPage }) => {
    orderListPage = new OrderListPage(seededPage)
    await orderListPage.goto()
    await orderListPage.waitForOrderListReady()
  })

  test("should display today's orders by default", async ({ seededPage }) => {
    // Verify the page header shows today's date with "(今天)" label
    const heading = await orderListPage.getDateHeading()
    expect(heading).toContain('(今天)')

    // Verify that seeded orders are displayed (5 orders were seeded)
    const orderCount = await orderListPage.getOrderCardCount()
    expect(orderCount).toBe(5)
  })

  test('should display order list with basic information', async ({
    seededPage,
  }) => {
    // Verify order cards are visible
    const cards = orderListPage.orderCards
    await expect(cards.first()).toBeVisible()

    // Verify each card has a total amount displayed
    const firstCardTotal = await orderListPage.getOrderTotal(0)
    expect(firstCardTotal).toContain('金額')

    // Verify the summary section shows statistics
    const summary = await orderListPage.getSummary()
    expect(summary.values.length).toBeGreaterThan(0)
    expect(summary.titles.length).toBeGreaterThan(0)

    // Verify summary includes order count and total amount fields
    expect(summary.titles.some(t => t.includes('訂單數量'))).toBe(true)
    expect(summary.titles.some(t => t.includes('總營業額'))).toBe(true)
  })

  test('should delete an order', async ({ seededPage }) => {
    // Get initial count
    const initialCount = await orderListPage.getOrderCardCount()
    expect(initialCount).toBe(5)

    // Delete the first order
    await orderListPage.deleteOrder(0)

    // Confirm deletion in the modal
    await orderListPage.confirmDelete()

    // Wait for the UI to update
    await seededPage.waitForTimeout(1000)

    // Verify order count decreased
    const newCount = await orderListPage.getOrderCardCount()
    expect(newCount).toBe(initialCount - 1)
  })

  test('should show the search drawer', async ({ seededPage }) => {
    // Verify search button is visible
    await expect(orderListPage.searchButton).toBeVisible()

    // Open the search drawer
    await orderListPage.openSearch()

    // Verify the search drawer is visible
    await expect(orderListPage.searchDrawer).toBeVisible()

    // Verify search drawer contains date picker and keyword fields
    const dateLabel = seededPage
      .locator('.resta-orderlist-search-drawer')
      .getByRole('heading', { name: '日期', exact: true })
    await expect(dateLabel).toBeVisible()

    const keywordLabel = seededPage
      .locator('.resta-orderlist-search-drawer')
      .getByRole('heading', { name: '關鍵字' })
    await expect(keywordLabel).toBeVisible()
  })

  test('should display order details correctly', async ({ seededPage }) => {
    // Check that order cards show commodity names from seeded data
    // The seeded orders contain known commodity names
    // At least one card should contain a known commodity
    const knownCommodities = [
      '油淋雞腿飯',
      '排骨飯',
      '雞肉絲飯',
      '油淋雞腿',
      '招牌水餃',
      '果醋飲',
    ]
    const allCardsText = await orderListPage.orderCards.allTextContents()
    const allText = allCardsText.join(' ')

    const hasKnownCommodity = knownCommodities.some(name =>
      allText.includes(name),
    )
    expect(hasKnownCommodity).toBe(true)
  })

  test('should display order numbers', async ({ seededPage }) => {
    // Each order card should contain an order number reference
    const cards = orderListPage.orderCards
    const count = await cards.count()

    // Verify each card displays an order number
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const cardText = await card.textContent()
      // Each card shows "訂單編號: N" in its footer
      expect(cardText).toContain('訂單編號')
    }
  })
})

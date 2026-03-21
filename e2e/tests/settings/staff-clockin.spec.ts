import { test, expect } from '../../fixtures/base.fixture'
import { SettingsPage } from '../../page-objects/settings.page'

test.describe('Settings - Staff Clock-In Tab', () => {
  test('should display employee list with clock-in cards', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    // Switch to the staff tab
    await settings.switchTab('staff')
    await settings.waitForTabContent()

    // Verify employee cards are rendered (seeded data has 2 employees)
    const employeeCards = await settings.getStaffClockInCards()
    expect(employeeCards).toBe(2)

    // Verify employee names are visible
    const page = seededPage
    await expect(page.locator('[data-testid="employee-card"]', { hasText: '小明' })).toBeVisible()
    await expect(page.locator('[data-testid="employee-card"]', { hasText: '小華' })).toBeVisible()

    // Screenshot: clock-in card grid
    await page.screenshot({ path: 'e2e/test-results/screenshots/clockin-cards.png', fullPage: true })
  })

  test('should show attendance badge status for employees', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    await settings.switchTab('staff')
    await settings.waitForTabContent()

    // The seeded data has:
    // Employee 1 (小明): clockIn + clockOut -> "已下班"
    // Employee 2 (小華): clockIn only -> "正在上班"
    const page = seededPage

    // 小明 should show "已下班" badge
    const card1 = page.locator('[data-testid="employee-card"]', { hasText: '小明' })
    await expect(card1.locator('.ant-badge', { hasText: '已下班' })).toBeVisible()

    // 小華 should show "正在上班" badge
    const card2 = page.locator('[data-testid="employee-card"]', { hasText: '小華' })
    await expect(card2.locator('.ant-badge', { hasText: '正在上班' })).toBeVisible()

    // Screenshot: badge status display
    await page.screenshot({ path: 'e2e/test-results/screenshots/clockin-badge-status.png', fullPage: true })
  })

  test('should display records table view with attendance data', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    await settings.switchTab('staff')
    await settings.waitForTabContent()

    const page = seededPage

    // Switch to the "打卡記錄" sub-tab
    const recordsTab = page.locator('[data-node-key="records"]')
    await recordsTab.click()
    await page.waitForTimeout(500)

    // Table view should be active by default — verify table is visible
    const table = page.locator('.ant-tabs-tabpane-active table')
    await expect(table).toBeVisible()

    // Screenshot: records table view
    await page.screenshot({ path: 'e2e/test-results/screenshots/records-table-view.png', fullPage: true })
  })

  test('should display records calendar view', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    await settings.switchTab('staff')
    await settings.waitForTabContent()

    const page = seededPage

    // Switch to the "打卡記錄" sub-tab
    const recordsTab = page.locator('[data-node-key="records"]')
    await recordsTab.click()
    await page.waitForTimeout(500)

    // Click the calendar toggle button (月曆)
    const calendarBtn = page.locator('button', { hasText: '月曆' })
    await calendarBtn.click()
    await page.waitForTimeout(300)

    // Screenshot: records calendar view
    await page.screenshot({ path: 'e2e/test-results/screenshots/records-calendar-view.png', fullPage: true })
  })

  test('should display clock-in page at /clock-in route', async ({ seededPage }) => {
    const page = seededPage
    await page.goto('/clock-in')
    await page.waitForTimeout(1000)

    // Verify the page title
    await expect(page.locator('label', { hasText: '員工打卡' })).toBeVisible()

    // Verify employee cards are visible
    await expect(page.locator('[data-testid="employee-card"]').first()).toBeVisible()

    // Screenshot: standalone clock-in page
    await page.screenshot({ path: 'e2e/test-results/screenshots/clockin-page.png', fullPage: true })
  })
})

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
    await expect(page.locator('.ant-card', { hasText: '小明' })).toBeVisible()
    await expect(page.locator('.ant-card', { hasText: '小華' })).toBeVisible()
  })

  test('should show attendance badge status for employees', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    await settings.switchTab('staff')
    await settings.waitForTabContent()

    // The seeded data has:
    // Employee 1 (小明): clockIn + clockOut -> "已下班"
    // Employee 2 (小華): clockIn only -> "已上班"
    const page = seededPage

    // 小明 should show "已下班" badge
    const card1 = page.locator('.ant-card', { hasText: '小明' })
    await expect(card1.locator('.ant-badge', { hasText: '已下班' })).toBeVisible()

    // 小華 should show "已上班" badge
    const card2 = page.locator('.ant-card', { hasText: '小華' })
    await expect(card2.locator('.ant-badge', { hasText: '已上班' })).toBeVisible()
  })
})

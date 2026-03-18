import { test, expect } from '../../fixtures/base.fixture'
import { SettingsPage } from '../../page-objects/settings.page'

test.describe('Settings - StaffAdmin Tab (AuthGuard)', () => {
  test('should display 403 status when not logged in', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    // Switch to the staff-admin tab
    await settings.switchTab('staff-admin')
    await settings.waitForTabContent()

    // AuthGuard should show a Result component with 403 status
    const result = seededPage.locator('.ant-result')
    await expect(result).toBeVisible()

    // Verify the "權限不足" title is displayed
    const title = result.locator('.ant-result-title')
    await expect(title).toHaveText('權限不足')

    // Verify the subtitle mentions admin login
    const subtitle = result.locator('.ant-result-subtitle')
    await expect(subtitle).toContainText('管理員')
  })

  test('should display a login button for admin authentication', async ({ seededPage }) => {
    const settings = new SettingsPage(seededPage)
    await settings.goto('/settings')

    await settings.switchTab('staff-admin')
    await settings.waitForTabContent()

    // The AuthGuard should render a "管理員登入" button
    const loginButton = seededPage.locator('.ant-result .ant-btn', { hasText: '管理員登入' })
    await expect(loginButton).toBeVisible()

    // The button should have the Google icon
    const googleIcon = loginButton.locator('.anticon-google')
    await expect(googleIcon).toBeVisible()
  })
})

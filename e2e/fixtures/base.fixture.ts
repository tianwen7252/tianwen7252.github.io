import { test as base, expect, type Page } from '@playwright/test'
import { seedDatabase } from '../helpers/db-seed'
import { clearDatabase } from '../helpers/db-clear'
import { waitForAppReady } from '../helpers/wait-for-app'

/**
 * Extended Playwright test fixture providing:
 * - seededPage: page with pre-seeded IndexedDB data + app ready
 * - cleanPage: page with cleared IndexedDB data
 */
type TestFixtures = {
  seededPage: Page
  cleanPage: Page
}

export const test = base.extend<TestFixtures>({
  seededPage: async ({ page }, use) => {
    // Seed DB and wait for app to be ready
    await seedDatabase(page)
    // Hand the page to the test
    await use(page)
    // Cleanup after test
    await clearDatabase(page)
  },

  cleanPage: async ({ page }, use) => {
    // Navigate and wait for app init (so DB schema exists)
    await page.goto('/')
    await waitForAppReady(page)
    // Clear all data
    await clearDatabase(page)
    // Reload so the app re-initializes with empty DB
    await page.reload()
    await waitForAppReady(page)
    // Hand the page to the test
    await use(page)
  },
})

export { expect }

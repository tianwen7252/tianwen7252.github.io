import type { Page } from '@playwright/test'

/**
 * Wait for the App to fully initialize.
 * The app renders React with Ant Design components — we wait for
 * the root element to have content and for the network to be idle.
 */
export async function waitForAppReady(page: Page): Promise<void> {
  // Wait for the React root to have rendered content
  await page.waitForSelector('#root', { state: 'attached', timeout: 15_000 })

  // Wait for the Ant Design layout or Float Button to appear,
  // indicating the app has fully rendered
  await page.waitForSelector('.ant-float-btn', {
    state: 'visible',
    timeout: 15_000,
  })
}

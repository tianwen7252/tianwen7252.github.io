import { test, expect } from '../fixtures/base.fixture'

test.describe('PWA — Basic Validation', () => {
  test('should have a manifest link element', async ({ seededPage }) => {
    await seededPage.goto('/')

    // Verify <link rel="manifest"> exists in <head>
    const manifestLink = seededPage.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)
    const href = await manifestLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('manifest.json')
  })

  test('should have correct viewport meta tag', async ({ seededPage }) => {
    await seededPage.goto('/')

    // Verify <meta name="viewport"> exists and has expected content
    const viewportMeta = seededPage.locator('meta[name="viewport"]')
    await expect(viewportMeta).toHaveCount(1)

    const content = await viewportMeta.getAttribute('content')
    expect(content).toBeTruthy()
    // Must include width=device-width for responsive PWA
    expect(content).toContain('width=device-width')
    // Must include initial-scale=1.0
    expect(content).toContain('initial-scale=1.0')
    // Must disable user scaling for POS touch interface
    expect(content).toContain('user-scalable=no')
  })

  test('should have an apple-touch-icon link', async ({ seededPage }) => {
    await seededPage.goto('/')

    // Verify <link rel="apple-touch-icon"> exists for iOS home screen
    const appleTouchIcon = seededPage.locator('link[rel="apple-touch-icon"]')
    await expect(appleTouchIcon).toHaveCount(1)
    const href = await appleTouchIcon.getAttribute('href')
    expect(href).toBeTruthy()
  })

  test('should have manifest with correct PWA properties', async ({
    seededPage,
  }) => {
    await seededPage.goto('/')

    // Fetch the manifest.json and validate key properties
    const manifestLink = seededPage.locator('link[rel="manifest"]')
    const href = await manifestLink.getAttribute('href')

    const response = await seededPage.request.get(href!)
    expect(response.ok()).toBe(true)

    const manifest = await response.json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.display).toBeTruthy()
    expect(manifest.icons).toBeDefined()
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1)
  })
})

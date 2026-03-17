import { defineConfig } from '@playwright/test'

// Detect CI environment
const isCI = !!process.env.CI

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  // Parallel execution settings
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,

  // Reporter configuration
  reporter: isCI
    ? [
        ['github'],
        ['html', { outputFolder: './playwright-report', open: 'never' }],
      ]
    : [['html', { outputFolder: './playwright-report', open: 'never' }]],

  // Output directory for test artifacts
  outputDir: './test-results',

  use: {
    baseURL: 'http://localhost:4150',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // iPad device configurations
  projects: [
    {
      name: 'iPad-10-landscape',
      use: {
        viewport: { width: 2360, height: 1640 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'iPad-11-landscape',
      use: {
        viewport: { width: 2388, height: 1668 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  // Dev server configuration
  webServer: {
    command: 'npm run start',
    port: 4150,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})

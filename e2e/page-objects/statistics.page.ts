import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'
import { AppHeaderComponent } from './app-header.component'

/**
 * Page Object Model for the Statistics page.
 * Provides methods to interact with charts, summary stats, and date range controls.
 *
 * DOM structure (from Statistics.tsx):
 * - StickyHeader with title "統計報表" and RangePicker
 * - Summary section with 8 Ant Design Statistic components
 * - 8 Chart components (each renders a <canvas> via Chart.js)
 *
 * Note: Use navigateToStatistics() instead of goto('/statistics') for seeded pages,
 * because the app's lazy-loading + Dexie init behaves differently on full page reload
 * vs. client-side navigation.
 */
export class StatisticsPage extends BasePage {
  readonly header: Locator
  readonly headerTitle: Locator
  readonly rangePicker: Locator
  readonly summarySection: Locator
  readonly chartsContainer: Locator
  readonly appHeader: AppHeaderComponent

  constructor(page: Page) {
    super(page)
    this.appHeader = new AppHeaderComponent(page)
    // StickyHeader containing the title
    this.header = page.locator('.ant-space').filter({ hasText: '統計報表' })
    // The title label inside the header
    this.headerTitle = page.locator('label').filter({ hasText: '統計報表' })
    // Ant Design RangePicker component
    this.rangePicker = page.locator('.ant-picker-range')
    // Summary section containing Ant Design Statistic components
    this.summarySection = page.locator('.ant-statistic').first()
    // First canvas element (Chart.js)
    this.chartsContainer = page.locator('canvas').first()
  }

  /**
   * Navigate to the Statistics page via client-side routing (FloatButton menu).
   * Preferred over goto('/statistics') to avoid full page reload issues with Dexie.
   */
  async navigateToStatistics(): Promise<void> {
    await this.appHeader.goToStatistics()
  }

  /**
   * Wait for at least one chart canvas to be rendered.
   * Chart.js renders asynchronously, so we wait for the first canvas.
   */
  async waitForCharts(): Promise<void> {
    await this.page.waitForSelector('canvas', {
      state: 'visible',
      timeout: 15_000,
    })
  }

  /**
   * Get all canvas elements (Chart.js renders to <canvas>).
   */
  getChartCanvases(): Locator {
    return this.page.locator('canvas')
  }

  /**
   * Get the count of rendered chart canvases.
   */
  async getChartCount(): Promise<number> {
    return this.getChartCanvases().count()
  }

  /**
   * Get all Ant Design Statistic value elements in the summary section.
   * The Statistics page renders 8 Statistic components in two Flex rows.
   */
  getStatisticValues(): Locator {
    return this.page.locator('.ant-statistic')
  }
}

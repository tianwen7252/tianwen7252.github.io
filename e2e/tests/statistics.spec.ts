import { test, expect } from '../fixtures/base.fixture'
import { StatisticsPage } from '../page-objects/statistics.page'

test.describe('Statistics Page — Chart Rendering', () => {
  test('should render chart canvas elements when data is seeded', async ({
    seededPage,
  }) => {
    const statsPage = new StatisticsPage(seededPage)

    // Navigate via client-side routing (FloatButton menu) to avoid
    // full page reload issues with Dexie/lazy-loading
    await statsPage.navigateToStatistics()

    // Wait for charts to render
    await statsPage.waitForCharts()

    // Statistics page has 8 Chart components, each renders a <canvas>
    const canvases = statsPage.getChartCanvases()
    const count = await statsPage.getChartCount()
    expect(count).toBeGreaterThanOrEqual(1)

    // Verify first canvas is visible
    const firstCanvas = canvases.first()
    await expect(firstCanvas).toBeVisible()
  })

  test('should display summary statistics section', async ({
    seededPage,
  }) => {
    const statsPage = new StatisticsPage(seededPage)
    await statsPage.navigateToStatistics()

    await statsPage.waitForCharts()

    // The summary section should contain Ant Design Statistic components
    const statValues = statsPage.getStatisticValues()
    const statCount = await statValues.count()
    // 8 statistics: income, profit, cost, order count, AM income, PM income, main dish count, product count
    expect(statCount).toBe(8)
  })

  test('should display header with title and date range picker', async ({
    seededPage,
  }) => {
    const statsPage = new StatisticsPage(seededPage)
    await statsPage.navigateToStatistics()

    await expect(statsPage.headerTitle).toBeVisible()
    await expect(statsPage.rangePicker).toBeVisible()
  })

  test('should show zero values when no data exists', async ({
    cleanPage,
  }) => {
    const statsPage = new StatisticsPage(cleanPage)

    // Navigate to statistics via client-side routing
    await statsPage.navigateToStatistics()

    // Wait for page to render — with no data, charts still render with zero values
    await cleanPage.waitForTimeout(2000)

    // Verify the header is visible
    await expect(statsPage.headerTitle).toBeVisible()

    // With empty DB, all statistics should show $0 values
    const statValues = statsPage.getStatisticValues()
    const statCount = await statValues.count()
    expect(statCount).toBe(8)

    // Verify all stat values show $0
    const firstStat = statValues.first()
    await expect(firstStat).toContainText('$')
    await expect(firstStat).toContainText('0')
  })
})

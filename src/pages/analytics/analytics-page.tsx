/**
 * AnalyticsPage — main statistics page.
 * Hosts the tab bar (product/staff) and date picker,
 * then conditionally renders the appropriate stats section.
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { AnalyticsTabBar } from '@/components/analytics/analytics-tab-bar'
import { AnalyticsDatePicker } from '@/components/analytics/analytics-date-picker'
import { ProductKpiGrid } from '@/components/analytics/product-stats/product-kpi-grid'
import { OrderTimeChart } from '@/components/analytics/product-stats/order-time-chart'
import { Bottom10Bentos } from '@/components/analytics/product-stats/bottom5-bentos'
import { Top10ProductsChart } from '@/components/analytics/product-stats/top10-products-chart'
import { RevenueComparisonChart } from '@/components/analytics/product-stats/revenue-comparison-chart'
import { AvgOrderValueChart } from '@/components/analytics/product-stats/avg-order-value-chart'
import { ProductTrendChart } from '@/components/analytics/product-stats/product-trend-chart'
import { RevenueHeatmap } from '@/components/analytics/product-stats/revenue-heatmap'
import { StaffStats } from '@/components/analytics/staff-stats/staff-stats'
import { formatWeekDays } from '@/lib/analytics/format-week-days'
import type { AnalyticsTab } from '@/components/analytics/analytics-tab-bar'
import type {
  StatisticsRepository,
  ProductKpis,
  HourBucket,
  ProductRanking,
  DailyRevenue,
} from '@/lib/repositories/statistics-repository'

// ─── ProductStats ─────────────────────────────────────────────────────────────

interface ProductStatsProps {
  startDate: Date
  endDate: Date
  /** Repository for KPI queries. Required; caller must supply a valid instance. */
  statisticsRepo: StatisticsRepository
}

function ProductStats({
  startDate,
  endDate,
  statisticsRepo,
}: ProductStatsProps) {
  const { t } = useTranslation()
  const [kpis, setKpis] = useState<ProductKpis | null>(null)
  const [hourlyData, setHourlyData] = useState<HourBucket[]>([])
  const [topItems, setTopItems] = useState<ProductRanking[]>([])
  const [bottomBentos, setBottomBentos] = useState<ProductRanking[]>([])
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue'>('quantity')
  // Chart data for the four new panels
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([])
  const [prevMonthData, setPrevMonthData] = useState<DailyRevenue[]>([])
  const [avgOrderValue, setAvgOrderValue] = useState<DailyRevenue[]>([])
  const [productTrendData, setProductTrendData] = useState<DailyRevenue[]>([])
  const [commodities, setCommodities] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Fetch KPIs, hourly distribution, bottom bentos, daily revenue, avg order
  // value, and commodity list together. Re-runs when date range or repo changes.
  useEffect(() => {
    let cancelled = false

    setKpis(null)
    setHourlyData([])
    setBottomBentos([])
    setDailyRevenue([])
    setPrevMonthData([])
    setAvgOrderValue([])
    setError(null)

    const range = {
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    }

    // Previous month range derived from the start of the current range.
    const prevStart = dayjs(startDate)
      .subtract(1, 'month')
      .startOf('month')
      .toDate()
    const prevEnd = dayjs(startDate)
      .subtract(1, 'month')
      .endOf('month')
      .toDate()
    const prevRange = {
      startDate: prevStart.getTime(),
      endDate: prevEnd.getTime(),
    }

    Promise.all([
      statisticsRepo.getProductKpis(range),
      statisticsRepo.getHourlyOrderDistribution(range),
      statisticsRepo.getBottomBentos(range, 10),
      statisticsRepo.getDailyRevenue(range),
      statisticsRepo.getDailyRevenue(prevRange),
      statisticsRepo.getAvgOrderValue(range),
    ])
      .then(
        ([
          kpisResult,
          hourlyResult,
          bottomResult,
          currentRev,
          prevRev,
          avgResult,
        ]) => {
          if (cancelled) return
          setKpis(kpisResult)
          setHourlyData(hourlyResult)
          setBottomBentos(bottomResult)
          // Pad both series to fill the full date range.
          setDailyRevenue(formatWeekDays(currentRev, startDate, endDate))
          setPrevMonthData(formatWeekDays(prevRev, prevStart, prevEnd))
          setAvgOrderValue(formatWeekDays(avgResult, startDate, endDate))
        },
      )
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t('analytics.loadError'),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [statisticsRepo, startDate, endDate, t])

  // Fetch top products separately so sortBy changes only re-fetch this slice.
  useEffect(() => {
    let cancelled = false

    setTopItems([])

    const range = {
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    }

    statisticsRepo
      .getTopProducts(range, 10, sortBy)
      .then((result) => {
        if (!cancelled) setTopItems(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t('analytics.rankLoadError'),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [statisticsRepo, startDate, endDate, sortBy])

  // Fetch commodities list once on mount (repo reference stable).
  useEffect(() => {
    let cancelled = false
    import('@/lib/repositories/provider')
      .then(({ getCommodityRepo }) => {
        try {
          const repo = getCommodityRepo()
          return repo.findOnMarket()
        } catch {
          return []
        }
      })
      .then((items) => {
        if (cancelled) return
        const opts = items.map((c) => ({ id: c.id, name: c.name }))
        setCommodities(opts)
        if (opts.length > 0 && selectedCommodityId === '') {
          setSelectedCommodityId(opts[0]!.id)
        }
      })
      .catch(() => {
        // Non-critical — chart simply shows no commodities to pick from.
      })

    return () => {
      cancelled = true
    }
    // Run only once; selectedCommodityId intentionally omitted to avoid
    // re-running the import when the user changes the selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statisticsRepo])

  // Re-fetch product trend data when the selected commodity or date range changes.
  useEffect(() => {
    if (!selectedCommodityId) return

    let cancelled = false
    setProductTrendData([])

    const range = {
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    }

    statisticsRepo
      .getProductDailyRevenue(range, selectedCommodityId)
      .then((result) => {
        if (!cancelled) {
          setProductTrendData(formatWeekDays(result, startDate, endDate))
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t('analytics.trendLoadError'),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [statisticsRepo, startDate, endDate, selectedCommodityId])

  const currentMonth = startDate.getMonth() + 1
  const currentYear = startDate.getFullYear()

  return (
    <section
      aria-label={t('analytics.productStats')}
      className="flex flex-col gap-6"
    >
      {error !== null && <p className="text-destructive text-base">{error}</p>}

      {kpis !== null && <ProductKpiGrid kpis={kpis} />}

      <OrderTimeChart data={hourlyData} />

      <Top10ProductsChart
        items={topItems}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <RevenueComparisonChart
        currentData={dailyRevenue}
        prevData={prevMonthData}
      />

      <AvgOrderValueChart data={avgOrderValue} />

      {commodities.length > 0 && (
        <ProductTrendChart
          data={productTrendData}
          commodities={commodities}
          selectedId={selectedCommodityId}
          onSelectChange={setSelectedCommodityId}
        />
      )}

      <RevenueHeatmap
        data={dailyRevenue}
        year={currentYear}
        month={currentMonth}
      />

      {bottomBentos.length > 0 && <Bottom10Bentos items={bottomBentos} />}
    </section>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AnalyticsPageProps {
  /**
   * Statistics repository for product KPI queries.
   * When omitted, the component attempts to use getStatisticsRepo() from the
   * global provider. Tests should always supply this prop to avoid the
   * provider singleton.
   */
  statisticsRepo?: StatisticsRepository
}

/**
 * Analytics page scaffold: tab bar + date picker + conditional stats sections.
 * Default date is today (single day).
 */
export function AnalyticsPage({
  statisticsRepo: repoProp,
}: AnalyticsPageProps = {}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('product')
  const [startDate, setStartDate] = useState<Date>(
    dayjs().startOf('day').toDate(),
  )
  const [endDate, setEndDate] = useState<Date>(dayjs().endOf('day').toDate())
  const [dynamicRepo, setDynamicRepo] = useState<StatisticsRepository | null>(
    null,
  )
  const [providerError, setProviderError] = useState<string | null>(null)

  // Lazily resolve the global singleton on first render when no prop is given.
  useEffect(() => {
    if (repoProp !== undefined) return
    import('@/lib/repositories/provider')
      .then(({ getStatisticsRepo }) => {
        try {
          setDynamicRepo(getStatisticsRepo())
        } catch (err) {
          setProviderError(
            err instanceof Error
              ? err.message
              : t('analytics.providerInitError'),
          )
        }
      })
      .catch(() => {
        setProviderError(t('analytics.providerLoadError'))
      })
  }, [repoProp, t])

  // repoProp always takes precedence; fall back to the lazily resolved singleton.
  const resolvedRepo = repoProp ?? dynamicRepo

  function handleDateChange(start: Date, end: Date) {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <AnalyticsTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <AnalyticsDatePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
      />

      {activeTab === 'product' ? (
        providerError !== null ? (
          <section aria-label={t('analytics.productStats')}>
            <p className="text-destructive text-base">{providerError}</p>
          </section>
        ) : resolvedRepo !== null ? (
          <ProductStats
            startDate={startDate}
            endDate={endDate}
            statisticsRepo={resolvedRepo}
          />
        ) : (
          <section aria-label={t('analytics.productStats')} />
        )
      ) : providerError !== null ? (
        <section aria-label={t('analytics.staffStats')}>
          <p className="text-destructive text-base">{providerError}</p>
        </section>
      ) : resolvedRepo !== null ? (
        <StaffStats
          startDate={startDate}
          endDate={endDate}
          statisticsRepo={resolvedRepo}
        />
      ) : (
        <section aria-label={t('analytics.staffStats')} />
      )}
    </div>
  )
}

/**
 * AnalyticsPage — main statistics page.
 * Hosts the tab bar (product/staff) and date picker,
 * then conditionally renders the appropriate stats section.
 */

import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { AnalyticsTabBar } from '@/components/analytics/analytics-tab-bar'
import { AnalyticsDatePicker } from '@/components/analytics/analytics-date-picker'
import { ProductKpiGrid } from '@/components/analytics/product-stats/product-kpi-grid'
import type { AnalyticsTab } from '@/components/analytics/analytics-tab-bar'
import type {
  StatisticsRepository,
  ProductKpis,
} from '@/lib/repositories/statistics-repository'

// ─── ProductStats ─────────────────────────────────────────────────────────────

interface ProductStatsProps {
  startDate: Date
  endDate: Date
  /** Repository for KPI queries. Required; caller must supply a valid instance. */
  statisticsRepo: StatisticsRepository
}

function ProductStats({ startDate, endDate, statisticsRepo }: ProductStatsProps) {
  const [kpis, setKpis] = useState<ProductKpis | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setKpis(null)
    setError(null)

    statisticsRepo
      .getProductKpis({
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
      })
      .then(result => {
        if (!cancelled) setKpis(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '載入失敗')
        }
      })

    return () => {
      cancelled = true
    }
  }, [statisticsRepo, startDate, endDate])

  return (
    <section aria-label="商品統計">
      {error !== null && (
        <p className="text-destructive text-base">{error}</p>
      )}
      {kpis !== null && <ProductKpiGrid kpis={kpis} />}
    </section>
  )
}

// ─── StaffStats ───────────────────────────────────────────────────────────────

function StaffStats({ startDate, endDate: _endDate }: { startDate: Date; endDate: Date }) {
  void _endDate
  return (
    <section aria-label="員工統計">
      <p className="text-muted-foreground text-base">
        員工統計 — {dayjs(startDate).format('YYYY-MM')}
      </p>
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
 */
export function AnalyticsPage({ statisticsRepo: repoProp }: AnalyticsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('product')
  const [startDate, setStartDate] = useState<Date>(
    dayjs().startOf('month').toDate(),
  )
  const [endDate, setEndDate] = useState<Date>(
    dayjs().endOf('month').toDate(),
  )
  const [dynamicRepo, setDynamicRepo] = useState<StatisticsRepository | null>(null)

  // Lazily resolve the global singleton on first render when no prop is given.
  useEffect(() => {
    if (repoProp !== undefined) return
    import('@/lib/repositories/provider')
      .then(({ getStatisticsRepo }) => {
        try {
          setDynamicRepo(getStatisticsRepo())
        } catch {
          // Repository not yet initialized — ProductStats will simply not render.
        }
      })
      .catch(() => {
        // Dynamic import failure — silently ignore.
      })
  }, [repoProp])

  // repoProp always takes precedence; fall back to the lazily resolved singleton.
  const resolvedRepo = repoProp ?? dynamicRepo

  function handleDateChange(start: Date, end: Date) {
    setStartDate(start)
    setEndDate(end)
  }

  function handleTabChange(tab: AnalyticsTab) {
    setActiveTab(tab)
    // When switching to staff mode, snap to the current month
    if (tab === 'staff') {
      setStartDate(dayjs().startOf('month').toDate())
      setEndDate(dayjs().endOf('month').toDate())
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <AnalyticsTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <AnalyticsDatePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        mode={activeTab === 'staff' ? 'month' : 'range'}
      />

      {activeTab === 'product' ? (
        resolvedRepo !== null ? (
          <ProductStats
            startDate={startDate}
            endDate={endDate}
            statisticsRepo={resolvedRepo}
          />
        ) : (
          <section aria-label="商品統計" />
        )
      ) : (
        <StaffStats startDate={startDate} endDate={endDate} />
      )}
    </div>
  )
}

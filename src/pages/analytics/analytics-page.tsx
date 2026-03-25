/**
 * AnalyticsPage — main statistics page.
 * Hosts the tab bar (product/staff) and date picker,
 * then conditionally renders the appropriate stats section.
 */

import { useState } from 'react'
import dayjs from 'dayjs'
import { AnalyticsTabBar } from '@/components/analytics/analytics-tab-bar'
import { AnalyticsDatePicker } from '@/components/analytics/analytics-date-picker'
import type { AnalyticsTab } from '@/components/analytics/analytics-tab-bar'

// ─── Placeholder sections ─────────────────────────────────────────────────────

function ProductStats({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  return (
    <section aria-label="商品統計">
      <p className="text-muted-foreground text-base">
        商品統計 — {dayjs(startDate).format('YYYY-MM-DD')} 至 {dayjs(endDate).format('YYYY-MM-DD')}
      </p>
    </section>
  )
}

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

/**
 * Analytics page scaffold: tab bar + date picker + conditional stats sections.
 */
export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('product')
  const [startDate, setStartDate] = useState<Date>(
    dayjs().startOf('month').toDate(),
  )
  const [endDate, setEndDate] = useState<Date>(
    dayjs().endOf('month').toDate(),
  )

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
        <ProductStats startDate={startDate} endDate={endDate} />
      ) : (
        <StaffStats startDate={startDate} endDate={endDate} />
      )}
    </div>
  )
}

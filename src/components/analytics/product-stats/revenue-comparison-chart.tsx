/**
 * RevenueComparisonChart — overlapping area chart comparing current month vs
 * previous month daily revenue.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueComparisonChartProps {
  /** Current month daily revenue entries. */
  currentData: DailyRevenue[]
  /** Previous month daily revenue entries (slots already padded by caller). */
  prevData: DailyRevenue[]
}

/** Merged row used by recharts — keyed by day-of-month (1–31). */
interface MergedRow {
  day: number
  本月: number
  上月: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_HEIGHT = 250
const COLOR_CURRENT = 'hsl(221 83% 53%)'
const COLOR_PREV = 'hsl(142 71% 45%)'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Merge current and previous month arrays into a unified array indexed by
 * day-of-month so recharts can overlay both series on the same X axis.
 */
function mergeByDay(
  current: DailyRevenue[],
  prev: DailyRevenue[],
): MergedRow[] {
  const currentByDay = new Map<number, number>()
  for (const d of current) {
    const day = Number(d.date.split('-')[2])
    currentByDay.set(day, d.revenue)
  }

  const prevByDay = new Map<number, number>()
  for (const d of prev) {
    const day = Number(d.date.split('-')[2])
    prevByDay.set(day, d.revenue)
  }

  // Determine range: union of days present in either dataset, capped at 31.
  const maxDay = Math.max(
    ...[...currentByDay.keys(), ...prevByDay.keys(), 0],
    current.length,
    prev.length,
  )

  if (maxDay <= 0) return []

  return Array.from({ length: maxDay }, (_, i) => {
    const day = i + 1
    return {
      day,
      本月: currentByDay.get(day) ?? 0,
      上月: prevByDay.get(day) ?? 0,
    }
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders an AreaChart overlaying this month vs last month daily revenue.
 */
export function RevenueComparisonChart({
  currentData,
  prevData,
}: RevenueComparisonChartProps) {
  const chartData = mergeByDay(currentData, prevData)

  return (
    <div aria-label="本月 vs 上月比較" role="region">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip formatter={(value) => [value, '']} labelFormatter={(label) => `第 ${label} 日`} />
          <Legend />
          <Area
            type="monotone"
            dataKey="本月"
            name="本月"
            stroke={COLOR_CURRENT}
            fill={COLOR_CURRENT}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="上月"
            name="上月"
            stroke={COLOR_PREV}
            fill={COLOR_PREV}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * RevenueComparisonChart — overlapping area chart comparing current month vs
 * previous month daily revenue.
 */

import { useTranslation } from 'react-i18next'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
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
  currentMonth: number
  previousMonth: number
}

// ─── Chart config (static colors — labels resolved inside component) ──────────

const CHART_COLORS = {
  currentMonth: 'hsl(var(--chart-1))',
  previousMonth: 'hsl(var(--chart-2))',
} as const

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
      currentMonth: currentByDay.get(day) ?? 0,
      previousMonth: prevByDay.get(day) ?? 0,
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
  const { t } = useTranslation()
  const chartData = mergeByDay(currentData, prevData)

  // Chart config built inside component so labels use translated strings.
  const chartConfig = {
    currentMonth: {
      label: t('analytics.currentMonth'),
      color: CHART_COLORS.currentMonth,
    },
    previousMonth: {
      label: t('analytics.previousMonth'),
      color: CHART_COLORS.previousMonth,
    },
  } satisfies ChartConfig

  return (
    <div aria-label={t('analytics.currentVsPrevMonth')} role="region">
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }} accessibilityLayer>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="currentMonth"
            name={t('analytics.currentMonth')}
            stroke="var(--color-currentMonth)"
            fill="var(--color-currentMonth)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="previousMonth"
            name={t('analytics.previousMonth')}
            stroke="var(--color-previousMonth)"
            fill="var(--color-previousMonth)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

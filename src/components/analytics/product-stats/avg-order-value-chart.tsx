/**
 * AvgOrderValueChart — line chart showing daily average order value with a
 * 7-day moving average overlay.
 */

import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
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

interface AvgOrderValueChartProps {
  /** Daily average order value series (revenue field = avg order value). */
  data: DailyRevenue[]
}

/** Merged row with raw value and 7-day moving average. */
interface ChartRow {
  day: number
  avgOrderValue: number
  movingAvg7d: number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_SIZE = 7

// ─── Chart config (static colors — labels resolved inside component) ──────────

const CHART_COLORS = {
  avgOrderValue: 'hsl(var(--chart-1))',
  movingAvg7d: 'hsl(var(--chart-2))',
} as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute a 7-day trailing moving average over the revenue series.
 * Returns null for positions with fewer than WINDOW_SIZE preceding points.
 */
function computeMovingAverage(values: number[], window: number): (number | null)[] {
  return values.map((_, i) => {
    if (i < window - 1) return null
    const slice = values.slice(i - window + 1, i + 1)
    const sum = slice.reduce((acc, v) => acc + v, 0)
    return Math.round((sum / window) * 100) / 100
  })
}

/**
 * Transform DailyRevenue array into recharts-compatible rows with moving avg.
 */
function buildChartData(data: DailyRevenue[]): ChartRow[] {
  const values = data.map(d => d.revenue)
  const ma = computeMovingAverage(values, WINDOW_SIZE)
  return data.map((d, i) => ({
    day: Number(d.date.split('-')[2]),
    avgOrderValue: d.revenue,
    movingAvg7d: ma[i] ?? null,
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a LineChart with raw average order value and a 7-day moving average.
 */
export function AvgOrderValueChart({ data }: AvgOrderValueChartProps) {
  const { t } = useTranslation()
  const chartData = buildChartData(data)

  // Chart config built inside component so labels use translated strings.
  const chartConfig = {
    avgOrderValue: {
      label: t('analytics.avgOrderValue'),
      color: CHART_COLORS.avgOrderValue,
    },
    movingAvg7d: {
      label: t('analytics.movingAvg7d'),
      color: CHART_COLORS.movingAvg7d,
    },
  } satisfies ChartConfig

  return (
    <div aria-label={t('analytics.avgOrderValueTrend')} role="region">
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }} accessibilityLayer>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="avgOrderValue"
            name={t('analytics.avgOrderValue')}
            stroke="var(--color-avgOrderValue)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="movingAvg7d"
            name={t('analytics.movingAvg7d')}
            stroke="var(--color-movingAvg7d)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            strokeDasharray="4 2"
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

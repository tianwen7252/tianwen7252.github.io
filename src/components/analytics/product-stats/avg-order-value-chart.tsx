/**
 * AvgOrderValueChart — line chart showing daily average order value with a
 * 7-day moving average overlay.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvgOrderValueChartProps {
  /** Daily average order value series (revenue field = avg order value). */
  data: DailyRevenue[]
}

/** Merged row with raw value and 7-day moving average. */
interface ChartRow {
  day: number
  客單價: number
  '7日均線': number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_HEIGHT = 250
const WINDOW_SIZE = 7
const COLOR_RAW = 'hsl(221 83% 53%)'
const COLOR_MA = 'hsl(38 92% 50%)'

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
    客單價: d.revenue,
    '7日均線': ma[i] ?? null,
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a LineChart with raw average order value and a 7-day moving average.
 */
export function AvgOrderValueChart({ data }: AvgOrderValueChartProps) {
  const chartData = buildChartData(data)

  return (
    <div aria-label="平均客單價趨勢" role="region">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip formatter={(value) => [value, '']} labelFormatter={(label) => `第 ${label} 日`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="客單價"
            name="客單價"
            stroke={COLOR_RAW}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="7日均線"
            name="7日均線"
            stroke={COLOR_MA}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            strokeDasharray="4 2"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

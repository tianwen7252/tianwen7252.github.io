/**
 * OrderTimeChart — bar chart showing order count distribution across 24 hours.
 * The peak hour bar is highlighted with a distinct color.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { HourBucket } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderTimeChartProps {
  /** Full 24-element array of hourly order counts (hours 0–23). */
  data: HourBucket[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_COLOR_DEFAULT = 'hsl(var(--primary) / 0.4)'
const BAR_COLOR_PEAK = 'hsl(var(--primary))'
const CHART_HEIGHT = 250

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a responsive BarChart for hourly order distribution.
 * The hour with the highest count is highlighted with a full-opacity color.
 */
export function OrderTimeChart({ data }: OrderTimeChartProps) {
  // Find the peak hour index (first occurrence of the maximum count)
  const maxCount = data.reduce((max, b) => Math.max(max, b.count), 0)

  return (
    <div aria-label="訂單時間分布" role="region">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => String(v)}
          />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [value, '訂單數']}
            labelFormatter={(label) => `${label}:00`}
          />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell
                // biome-ignore lint/suspicious/noArrayIndexKey: hour index is stable positional key
                key={index}
                fill={entry.count === maxCount && maxCount > 0 ? BAR_COLOR_PEAK : BAR_COLOR_DEFAULT}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

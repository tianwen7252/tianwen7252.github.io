/**
 * OrderTimeChart — bar chart showing order count distribution across 24 hours.
 * The peak hour bar is highlighted with a distinct color.
 */

import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { HourBucket } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderTimeChartProps {
  /** Full 24-element array of hourly order counts (hours 0–23). */
  data: HourBucket[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_COLOR_DEFAULT = 'hsl(var(--chart-1) / 0.4)'
const BAR_COLOR_PEAK = 'hsl(var(--chart-1))'

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a responsive BarChart for hourly order distribution.
 * The hour with the highest count is highlighted with a full-opacity color.
 */
export function OrderTimeChart({ data }: OrderTimeChartProps) {
  const { t } = useTranslation()

  // Chart config built inside component so labels use translated strings.
  const chartConfig = {
    count: {
      label: t('analytics.orderCountLabel'),
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  // Find the peak hour index (first occurrence of the maximum count)
  const maxCount = data.reduce((max, b) => Math.max(max, b.count), 0)

  return (
    <div aria-label={t('analytics.orderTimeDistribution')} role="region">
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }} accessibilityLayer>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => String(v)}
          />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
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
      </ChartContainer>
    </div>
  )
}

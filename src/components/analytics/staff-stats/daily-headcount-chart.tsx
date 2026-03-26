/**
 * DailyHeadcountChart — line chart showing daily attendance headcount.
 * X axis: date, Y axis: number of employees who attended.
 * Uses Recharts LineChart with monotone interpolation.
 */

import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { DailyHeadcount } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyHeadcountChartProps {
  data: DailyHeadcount[]
}

// ─── Static chart color ───────────────────────────────────────────────────────

const CHART_COLOR = 'hsl(var(--chart-1))'

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Renders a line chart with one point per day showing attendance headcount.
 * The caller is responsible for zero-filling missing dates before passing data.
 */
export function DailyHeadcountChart({ data }: DailyHeadcountChartProps) {
  const { t } = useTranslation()

  // Chart config built inside component so labels use translated strings.
  const chartConfig = {
    count: {
      label: t('analytics.headcount'),
      color: CHART_COLOR,
    },
  } satisfies ChartConfig

  return (
    <section aria-label={t('analytics.dailyHeadcount')}>
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <LineChart data={data} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="count"
            name={t('analytics.headcount')}
            stroke="var(--color-count)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ChartContainer>
    </section>
  )
}

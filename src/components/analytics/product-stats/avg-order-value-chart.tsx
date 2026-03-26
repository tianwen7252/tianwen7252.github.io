/**
 * AvgOrderValueChart — line chart showing daily average order value with a
 * 7-day moving average overlay. Two lines use different colors.
 */

import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { ChartEmpty } from '@/components/analytics/chart-empty'
import { useAppStore } from '@/stores/app-store'
import { CHART_PALETTES } from '@/lib/analytics/chart-colors'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvgOrderValueChartProps {
  data: DailyRevenue[]
}

interface ChartRow {
  day: number
  avgOrderValue: number
  movingAvg7d: number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_SIZE = 7

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeMovingAverage(values: number[], window: number): (number | null)[] {
  return values.map((_, i) => {
    if (i < window - 1) return null
    const slice = values.slice(i - window + 1, i + 1)
    const sum = slice.reduce((acc, v) => acc + v, 0)
    return Math.round((sum / window) * 100) / 100
  })
}

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

export function AvgOrderValueChart({ data }: AvgOrderValueChartProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize
  const chartData = buildChartData(data)

  // Palette 4: Berry Garden
  const palette = CHART_PALETTES.berryGarden

  const chartConfig = {
    avgOrderValue: {
      label: t('analytics.avgOrderValue'),
      color: palette[0],
    },
    movingAvg7d: {
      label: t('analytics.movingAvg7d'),
      color: palette[1],
    },
  } satisfies ChartConfig

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.avgOrderValueTitle')}</CardTitle>
        <CardDescription>{t('analytics.avgOrderValueDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every(d => d.avgOrderValue === 0) ? <ChartEmpty /> : (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <LineChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize }} />
            <YAxis tick={{ fontSize }} allowDecimals={false} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="avgOrderValue"
              name={t('analytics.avgOrderValue')}
              stroke="var(--color-avgOrderValue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="movingAvg7d"
              name={t('analytics.movingAvg7d')}
              stroke="var(--color-movingAvg7d)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

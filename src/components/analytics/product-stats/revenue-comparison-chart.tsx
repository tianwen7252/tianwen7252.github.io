/**
 * RevenueComparisonChart — overlapping area chart comparing current month vs
 * previous month daily revenue. Two areas use different colors.
 */

import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
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

interface RevenueComparisonChartProps {
  currentData: DailyRevenue[]
  prevData: DailyRevenue[]
}

interface MergedRow {
  day: number
  currentMonth: number
  previousMonth: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mergeByDay(current: DailyRevenue[], prev: DailyRevenue[]): MergedRow[] {
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

export function RevenueComparisonChart({
  currentData,
  prevData,
}: RevenueComparisonChartProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize
  const chartData = mergeByDay(currentData, prevData)

  // Palette 3: Sunset Harvest
  const palette = CHART_PALETTES.sunsetHarvest

  const chartConfig = {
    currentMonth: {
      label: t('analytics.currentMonth'),
      color: palette[0],
    },
    previousMonth: {
      label: t('analytics.previousMonth'),
      color: palette[1],
    },
  } satisfies ChartConfig

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.revenueComparisonTitle')}</CardTitle>
        <CardDescription>{t('analytics.revenueComparisonDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every(d => d.currentMonth === 0 && d.previousMonth === 0) ? <ChartEmpty /> : (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <AreaChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize }} />
            <YAxis tick={{ fontSize }} allowDecimals={false} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <defs>
              <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-currentMonth)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-currentMonth)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-previousMonth)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-previousMonth)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="currentMonth"
              name={t('analytics.currentMonth')}
              stroke="var(--color-currentMonth)"
              fill="url(#fillCurrent)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="previousMonth"
              name={t('analytics.previousMonth')}
              stroke="var(--color-previousMonth)"
              fill="url(#fillPrevious)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

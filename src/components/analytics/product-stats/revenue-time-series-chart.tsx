/**
 * RevenueTimeSeriesChart — stacked bar chart showing AM vs PM revenue per day.
 * Two stacked bars use Sunset Harvest palette colors.
 */

import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
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
import type { AmPmRevenueRow } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueTimeSeriesChartProps {
  data: AmPmRevenueRow[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract day number from YYYY-MM-DD string for the XAxis label. */
function formatDay(date: string): string {
  return date.split('-').pop() ?? date
}

/** Check whether all data points have zero revenue. */
function isAllZero(data: AmPmRevenueRow[]): boolean {
  return data.every(d => d.amRevenue === 0 && d.pmRevenue === 0)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueTimeSeriesChart({ data }: RevenueTimeSeriesChartProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize

  // Palette 3: Sunset Harvest (same as revenue comparison for consistency)
  const palette = CHART_PALETTES.sunsetHarvest

  const chartConfig = {
    amRevenue: {
      label: t('analytics.amRevenueShort'),
      color: palette[0],
    },
    pmRevenue: {
      label: t('analytics.pmRevenueShort'),
      color: palette[1],
    },
  } satisfies ChartConfig

  // Format data for XAxis display
  const chartData = data.map(d => ({
    ...d,
    day: formatDay(d.date),
  }))

  const isEmpty = data.length === 0 || isAllZero(data)

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.revenueTimeSeriesTitle')}</CardTitle>
        <CardDescription>{t('analytics.revenueTimeSeriesDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? <ChartEmpty /> : (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize }} />
            <YAxis tick={{ fontSize }} allowDecimals={false} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="amRevenue"
              name={t('analytics.amRevenueShort')}
              stackId="revenue"
              fill="var(--color-amRevenue)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="pmRevenue"
              name={t('analytics.pmRevenueShort')}
              stackId="revenue"
              fill="var(--color-pmRevenue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

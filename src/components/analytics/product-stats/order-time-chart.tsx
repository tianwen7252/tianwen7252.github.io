/**
 * OrderTimeChart — bar chart showing order count distribution across 24 hours.
 * The peak hour bar is highlighted with a distinct color.
 */

import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
import { CHART_PALETTES, getColor } from '@/lib/analytics/chart-colors'
import type { HourBucket } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderTimeChartProps {
  data: HourBucket[]
}

// ─── Constants — Palette 1: Moss Forest ───────────────────────────────────────

const PALETTE = CHART_PALETTES.mossForest

// ─── Component ───────────────────────────────────────────────────────────────

export function OrderTimeChart({ data }: OrderTimeChartProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize

  const chartConfig = {
    count: {
      label: t('analytics.orderCountLabel'),
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.orderTimeTitle')}</CardTitle>
        <CardDescription>{t('analytics.orderTimeDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 || data.every(d => d.count === 0) ? <ChartEmpty /> : (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize }}
              tickFormatter={(v: number) => `${v}:00`}
            />
            <YAxis tick={{ fontSize }} allowDecimals={false} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="count" position="top" offset={6} className="fill-foreground" fontSize={fontSize} />
              {data.map((_, index) => (
                <Cell key={index} fill={getColor(PALETTE, index)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

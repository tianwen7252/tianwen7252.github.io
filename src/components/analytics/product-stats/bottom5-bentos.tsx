/**
 * Bottom10Bentos — horizontal bar chart of the 10 lowest-selling bento items.
 * Uses the same layout pattern as Top10ProductsChart.
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
import type { ProductRanking } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bottom10BentosProps {
  items: ProductRanking[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_CHART_HEIGHT = 300
const ROW_HEIGHT = 40

// Palette 3: Sunset Harvest
const PALETTE = CHART_PALETTES.sunsetHarvest

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ChartRow {
  name: string
  value: number
}

function buildChartData(items: ProductRanking[]): ChartRow[] {
  return items.map(item => ({
    name: item.name,
    value: item.quantity,
  }))
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Bottom10Bentos({ items }: Bottom10BentosProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize

  const chartConfig = {
    value: {
      label: t('analytics.quantity'),
      color: 'var(--chart-4)',
    },
  } satisfies ChartConfig

  const chartData = buildChartData(items)
  const minHeight = Math.max(MIN_CHART_HEIGHT, items.length * ROW_HEIGHT)
  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.bottom10Title')}</CardTitle>
        <CardDescription>{t('analytics.bottom10Desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? <ChartEmpty /> : (
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ minHeight }}
        >
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickLine={false}
              tick={{ fontSize }}
              axisLine={false}
            />
            <XAxis
              type="number"
              domain={[0, maxValue * 1.13]}
              tick={{ fontSize }}
              hide
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar
              dataKey="value"
              name={t('analytics.quantity')}
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={getColor(PALETTE, i)} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize="var(--font-size)"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

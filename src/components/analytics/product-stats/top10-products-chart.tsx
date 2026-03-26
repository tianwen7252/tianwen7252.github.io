/**
 * Top10ProductsChart — horizontal bar chart ranking top 10 products.
 * Supports sorting by quantity or revenue via toggle buttons.
 */

import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/cn'
import { RippleButton } from '@/components/ui/ripple-button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { ChartEmpty } from '@/components/analytics/chart-empty'
import { useAppStore } from '@/stores/app-store'
import { CHART_PALETTES, getColor } from '@/lib/analytics/chart-colors'
import type { ProductRanking } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Top10ProductsChartProps {
  /** Up to 10 product items sorted by the active sort criterion. */
  items: ProductRanking[]
  /** Current sort mode. */
  sortBy: 'quantity' | 'revenue'
  /** Called when the user switches sort mode. */
  onSortChange: (sort: 'quantity' | 'revenue') => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_CHART_HEIGHT = 300
const ROW_HEIGHT = 40

// Palette 2: Ocean Breeze
const PALETTE = CHART_PALETTES.oceanBreeze

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ChartRow {
  name: string
  value: number
}

function buildChartData(
  items: ProductRanking[],
  sortBy: 'quantity' | 'revenue',
): ChartRow[] {
  return items.map((item) => ({
    name: item.name,
    value: sortBy === 'revenue' ? item.revenue : item.quantity,
  }))
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Top10ProductsChart({
  items,
  sortBy,
  onSortChange,
}: Top10ProductsChartProps) {
  const { t } = useTranslation()

  const chartConfig = {
    value: {
      label:
        sortBy === 'revenue' ? t('analytics.revenue') : t('analytics.quantity'),
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig

  const chartData = buildChartData(items, sortBy)
  const minHeight = Math.max(MIN_CHART_HEIGHT, items.length * ROW_HEIGHT)
  const fontSize = useAppStore().fontSize
  const maxValue = Math.max(...chartData.map((d) => d.value))

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.top10Title')}</CardTitle>
        <CardDescription>{t('analytics.top10Desc')}</CardDescription>
        <CardAction>
          <div className="flex gap-2">
            <RippleButton
              className={cn(
                'rounded-lg px-4 py-2 text-base transition-colors',
                sortBy === 'quantity'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              onClick={() => onSortChange('quantity')}
            >
              {t('analytics.sortByQuantity')}
            </RippleButton>
            <RippleButton
              className={cn(
                'rounded-lg px-4 py-2 text-base transition-colors',
                sortBy === 'revenue'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              onClick={() => onSortChange('revenue')}
            >
              {t('analytics.sortByRevenue')}
            </RippleButton>
          </div>
        </CardAction>
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

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              name={
                sortBy === 'revenue'
                  ? t('analytics.revenue')
                  : t('analytics.quantity')
              }
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

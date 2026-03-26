/**
 * OrderNotesChart — horizontal bar chart showing memo tag usage frequency.
 * Each bar represents a unique note/tag from order memos, colored distinctly.
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
import type { OrderNoteCount } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderNotesChartProps {
  /** Array of note tags with their usage count. */
  data: OrderNoteCount[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_CHART_HEIGHT = 300
const ROW_HEIGHT = 40

// Palette 2: Ocean Breeze (consistent with Top10ProductsChart)
const PALETTE = CHART_PALETTES.oceanBreeze

// ─── Component ───────────────────────────────────────────────────────────────

export function OrderNotesChart({ data }: OrderNotesChartProps) {
  const { t } = useTranslation()

  const chartConfig = {
    count: {
      label: t('analytics.noteCount'),
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig

  const minHeight = Math.max(MIN_CHART_HEIGHT, data.length * ROW_HEIGHT)
  const fontSize = useAppStore().fontSize
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 0

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.orderNotesTitle')}</CardTitle>
        <CardDescription>{t('analytics.orderNotesDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? <ChartEmpty /> : (
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ minHeight }}
        >
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              type="category"
              dataKey="note"
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
              dataKey="count"
              name={t('analytics.noteCount')}
              radius={[0, 4, 4, 0]}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={getColor(PALETTE, i)} />
              ))}
              <LabelList
                dataKey="count"
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
